# 🚀 DevamDurum PRO - Bulut Veritabanı & Canlı Yayın Kurulum Rehberi

Bu rehber ile DevamDurum uygulamasını **tamamen ücretsiz** olarak **Supabase (Bulut Veritabanı)** ve **Vercel (Canlı Web & Mobil Yayın)** platformlarına bağlayabilirsiniz.

---

## 📌 Adım 1: Supabase Bulut Veritabanını Oluşturma (2 Dakika)

1. [supabase.com](https://supabase.com) adresine gidin ve ücretsiz bir hesap açın (GitHub veya Google ile giriş yapabilirsiniz).
2. **"New Project"** (Yeni Proje) butonuna tıklayın:
   - **Name:** `DevamDurum` (veya okulunuzun adı)
   - **Database Password:** Güçlü bir şifre belirleyin (unutmamak için not edin).
   - **Region:** `Frankfurt (eu-central-1)` (Türkiye'ye en yakın ve en hızlı bölgedir).
   - **"Create new project"** butonuna basın ve veritabanının açılmasını 30 saniye bekleyin.

---

## 📌 Adım 2: Veritabanı Tablolarını Tek Tıkla Oluşturma (1 Dakika)

1. Supabase panelinde sol menüden **"SQL Editor"** sekmesine tıklayın.
2. **"New query"** butonuna basın.
3. Projenizin ana dizininde yer alan [`supabase_schema.sql`](file:///Users/barisbilir/Documents/antigravity/DevamDurum/supabase_schema.sql) dosyasının tüm içeriğini kopyalayıp buraya yapıştırın.
4. Sağ alttaki yeşil **"Run"** butonuna basın.
   * ✅ *Success. No rows returned* mesajını gördüğünüzde tüm tablolarınız, indeksleriniz ve anlık bildirimleriniz hazır demektir!

---

## 📌 Adım 3: Bağlantı Anahtarlarını Alma (30 Saniye)

1. Supabase panelinde sol alttaki **Project Settings** (Çark Simgesi) -> **API** sekmesine tıklayın.
2. Burada yer alan 2 değeri kopyalayın:
   - **Project URL:** (Örn: `https://xyzcompany.supabase.co`)
   - **Project API Keys -> `anon` `public`:** (Uzun bir harf dizisi)

3. Bu iki değeri projenizdeki `.env.local` dosyasına yazın:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://projeniz.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-anahtariniz-buraya
   ```

---

## 📌 Adım 4: Vercel ile Canlıya Alma (2 Dakika)

1. [vercel.com](https://vercel.com) adresine gidin ve ücretsiz hesap açın (GitHub hesabınızla bağlanın).
2. **"Add New..."** -> **"Project"** butonuna basıp GitHub'daki `DevamDurum` deponuzu seçin.
3. **"Environment Variables"** bölümünü açın ve 3. adımdaki iki değişkeni ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **"Deploy"** butonuna basın!
5. 1 dakika içinde size özel güvenli web adresiniz hazır olacak:  
   👉 `https://okul-devamdurum.vercel.app`

---

## 📱 Adım 5: Cep Telefonuna Uygulama Olarak Yükleme

* **iPhone (iOS Safari):**
  1. `https://okul-devamdurum.vercel.app` adresini Safari ile açın.
  2. Alttaki **Paylaş (Share)** simgesine basın.
  3. **"Ana Ekrana Ekle" (Add to Home Screen)** seçeneğini seçin.
  4. Artık telefonunuzda tıpkı bir mobil uygulama gibi logosuyla yer alacaktır.

* **Android (Chrome):**
  1. Chrome ile adresi açtığınızda altta çıkan **"Uygulamayı Yükle"** butonuna veya sağ üstteki 3 noktadan **"Uygulamayı Yükle / Ana Ekrana Ekle"** seçeneğine basmanız yeterlidir.

---

🎉 **Tebrikler!** Artık yıl boyu girdiğiniz tüm devamsızlık ve ikame kayıtları bulutta güvendedir ve telefonunuzdan yaptığınız her işlem okuldaki bilgisayarınızda anında güncellenir!
