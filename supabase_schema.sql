-- ==============================================================================
-- DevamDurum PRO - Supabase PostgreSQL Veritabanı Şeması
-- Bu SQL kodunu Supabase Dashboard -> SQL Editor kısmına yapıştırıp "RUN" butonuna basınız.
-- ==============================================================================

-- 1. Öğretmenler Tablosu (Teachers)
CREATE TABLE IF NOT EXISTS public.teachers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    branch TEXT NOT NULL DEFAULT 'Genel',
    level TEXT NOT NULL DEFAULT 'Ortaokul',
    phone TEXT,
    email TEXT,
    tc_no TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Devam / Devamsızlık Kayıtları Tablosu (Attendance Logs)
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('geldi', 'mazeretli', 'mazeretsiz', 'gec')),
    late_minutes INTEGER,
    note TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (teacher_id, date)
);

-- 3. İkame / Ders Doldurma Görevlendirmeleri Tablosu (Substitution Logs)
CREATE TABLE IF NOT EXISTS public.substitution_logs (
    id TEXT PRIMARY KEY,
    absent_teacher_id TEXT NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    substitute_teacher_id TEXT NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    lesson_hour INTEGER NOT NULL CHECK (lesson_hour BETWEEN 1 AND 8),
    class_info TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Haftalık Ders Programı Çizelgesi Tablosu (Schedule Slots)
CREATE TABLE IF NOT EXISTS public.schedule_slots (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    day TEXT NOT NULL CHECK (day IN ('Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma')),
    lesson_hour INTEGER NOT NULL CHECK (lesson_hour BETWEEN 1 AND 8),
    class_info TEXT DEFAULT '',
    is_duty_day BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (teacher_id, day, lesson_hour)
);

-- ==============================================================================
-- Performans İndeksleri (Hızlı Sorgulama İçin)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_logs(date);
CREATE INDEX IF NOT EXISTS idx_attendance_teacher ON public.attendance_logs(teacher_id);
CREATE INDEX IF NOT EXISTS idx_subs_date ON public.substitution_logs(date);
CREATE INDEX IF NOT EXISTS idx_subs_absent ON public.substitution_logs(absent_teacher_id);
CREATE INDEX IF NOT EXISTS idx_subs_substitute ON public.substitution_logs(substitute_teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedule_teacher ON public.schedule_slots(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedule_day ON public.schedule_slots(day);

-- ==============================================================================
-- Güvenlik (Row Level Security - RLS) Politikaları
-- Okul yönetimi için herkese açık okuma/yazma (veya Anon anahtarı ile erişim)
-- ==============================================================================
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substitution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_slots ENABLE ROW LEVEL SECURITY;

-- Anonim ve Yetkili Kullanıcılar İçin Tüm İzinleri Aç
DROP POLICY IF EXISTS "Allow full access to teachers" ON public.teachers;
CREATE POLICY "Allow full access to teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to attendance_logs" ON public.attendance_logs;
CREATE POLICY "Allow full access to attendance_logs" ON public.attendance_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to substitution_logs" ON public.substitution_logs;
CREATE POLICY "Allow full access to substitution_logs" ON public.substitution_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to schedule_slots" ON public.schedule_slots;
CREATE POLICY "Allow full access to schedule_slots" ON public.schedule_slots FOR ALL USING (true) WITH CHECK (true);

-- Realtime (Anlık Çoklu Cihaz Senkronizasyonu) Etkinleştirme
ALTER PUBLICATION supabase_realtime ADD TABLE public.teachers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.substitution_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedule_slots;
