'use client';

import { useState, useEffect, useCallback } from 'react';

const AUTH_KEYS = {
  PIN_HASH: 'dd_school_pin_code',
  AUTH_SESSION: 'dd_auth_session_active',
  AUTH_REMEMBER: 'dd_auth_remember_me',
};

// Default PIN if not set yet: '1453'
const DEFAULT_PIN = '1453';

const authListeners = new Set<() => void>();
function notifyAuthListeners() {
  authListeners.forEach((fn) => fn());
}

export function getStoredPin(): string {
  if (typeof window === 'undefined') return DEFAULT_PIN;
  try {
    return localStorage.getItem(AUTH_KEYS.PIN_HASH) || DEFAULT_PIN;
  } catch (e) {
    return DEFAULT_PIN;
  }
}

export function setStoredPin(newPin: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_KEYS.PIN_HASH, newPin);
  } catch (e) {}
}

export function checkAuthStatus(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const isRemembered = localStorage.getItem(AUTH_KEYS.AUTH_REMEMBER) === 'true';
    const isSessionActive = sessionStorage.getItem(AUTH_KEYS.AUTH_SESSION) === 'true';
    return isRemembered || isSessionActive;
  } catch (e) {
    return false;
  }
}

export function useAuthStore() {
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const refreshAuth = useCallback(() => {
    setIsAuthenticated(checkAuthStatus());
  }, []);

  useEffect(() => {
    setIsClient(true);
    refreshAuth();

    authListeners.add(refreshAuth);
    return () => {
      authListeners.delete(refreshAuth);
    };
  }, [refreshAuth]);

  const login = (inputPin: string, rememberMe: boolean = true): boolean => {
    const currentPin = getStoredPin();
    if (inputPin.trim() === currentPin.trim()) {
      try {
        if (rememberMe) {
          localStorage.setItem(AUTH_KEYS.AUTH_REMEMBER, 'true');
        } else {
          sessionStorage.setItem(AUTH_KEYS.AUTH_SESSION, 'true');
        }
      } catch (e) {}
      setIsAuthenticated(true);
      notifyAuthListeners();
      return true;
    }
    return false;
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_KEYS.AUTH_REMEMBER);
      sessionStorage.removeItem(AUTH_KEYS.AUTH_SESSION);
    } catch (e) {}
    setIsAuthenticated(false);
    notifyAuthListeners();
  };

  const changePin = (
    currentPin: string,
    newPin: string
  ): { success: boolean; message: string } => {
    const stored = getStoredPin();
    if (currentPin.trim() !== stored.trim()) {
      return { success: false, message: 'Mevcut PIN kodu hatalı!' };
    }
    if (newPin.trim().length < 4) {
      return { success: false, message: 'Yeni PIN kodu en az 4 karakter olmalıdır.' };
    }

    setStoredPin(newPin.trim());
    return { success: true, message: 'PIN kodu başarıyla güncellendi!' };
  };

  return {
    isClient,
    isAuthenticated,
    isPinModalOpen,
    setIsPinModalOpen,
    login,
    logout,
    changePin,
  };
}
