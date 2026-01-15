# Bloggo - Modern Blog Platformu

Modern, güvenli ve kullanıcı dostu bir blog platformu. Next.js, TypeScript ve NextAuth ile geliştirildi.

## ✨ Özellikler

- 🔐 **Güvenli Kimlik Doğrulama**
  - Email/şifre ile kayıt ve giriş
  - Google OAuth desteği
  - Bcrypt ile şifre hashleme
  - JWT tabanlı session yönetimi

- 👤 **Kullanıcı Yönetimi**
  - Benzersiz @kullaniciadi sistemi
  - Özelleştirilebilir takma adlar
  - Kullanıcı profil sayfaları
  - Takip/takipten çık özelliği

- 📝 **Blog Özellikleri**
  - Markdown desteği
  - Zengin metin editörü
  - Yazı oluşturma, düzenleme, silme
  - Yazar bilgileri ve tarih gösterimi

- 🎨 **Modern UI/UX**
  - Glassmorphism tasarım
  - Responsive düzen
  - Dark mode desteği
  - Smooth animasyonlar

- 🔒 **Güvenlik**
  - XSS koruması (DOMPurify)
  - Rate limiting
  - Content Security Policy
  - Input sanitization

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+ 
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın:**
   ```bash
   git clone https://github.com/EchoKatana/Bloggo.git
   cd Bloggo
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Environment değişkenlerini ayarlayın:**
   
   `.env.local` dosyası oluşturun:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-min-32-characters
   GOOGLE_CLIENT_ID=your-google-client-id (opsiyonel)
   GOOGLE_CLIENT_SECRET=your-google-client-secret (opsiyonel)
   ```

   **Not:** Google OAuth kullanmak istemiyorsanız, sadece email/şifre ile kayıt sistemi çalışacaktır.

4. **Development sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

5. **Tarayıcınızda açın:**
   ```
   http://localhost:3000
   ```

## 🎯 Kullanım

### Yeni Hesap Oluşturma

1. `/register` sayfasına gidin
2. Email, kullanıcı adı, takma ad ve şifrenizi girin
3. "Hesap Oluştur" butonuna tıklayın
4. Otomatik giriş yapılır!

### Yazı Oluşturma

1. Giriş yaptıktan sonra header'da "+ Yeni Yazı" butonuna tıklayın
2. Başlık ve içerik girin
3. "Yazıyı Yayınla" butonuna tıklayın

### Profil ve Takip

- Herhangi bir yazarın adına tıklayarak profiline gidin
- "Takip Et" butonuyla yazarları takip edin
- Kendi profilinizi "Profilim" menüsünden görüntüleyin

## 🏗️ Teknoloji Stack

- **Framework:** Next.js 15
- **Dil:** TypeScript
- **Styling:** CSS (Vanilla)
- **Auth:** NextAuth.js
- **Şifreleme:** bcryptjs
- **XSS Koruması:** isomorphic-dompurify
- **ID Üretimi:** uuid

## 📁 Proje Yapısı

```
BlogApp/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── login/        # Giriş sayfası
│   │   ├── register/     # Kayıt sayfası
│   │   ├── create/       # Yazı oluşturma
│   │   ├── profile/      # Kullanıcı profilleri
│   │   └── post/         # Yazı detay sayfaları
│   ├── components/       # React bileşenleri
│   ├── lib/              # Utility fonksiyonları
│   │   ├── db.ts         # Veritabanı fonksiyonları
│   │   ├── auth.ts       # Auth yardımcıları
│   │   └── security.ts   # Güvenlik utilities
│   └── types/            # TypeScript tipleri
├── data/                 # JSON veritabanı dosyaları
│   ├── users.json
│   └── posts.json
└── public/               # Statik dosyalar
```

## 🔐 Güvenlik

- Tüm şifreler bcrypt ile hashlenmiş olarak saklanır
- XSS saldırılarına karşı DOMPurify kullanılır
- CSRF koruması NextAuth tarafından sağlanır
- Rate limiting ile brute force saldırılar önlenir
- Secure headers (CSP, X-Frame-Options, vb.)

## 🧪 Admin Hesabı

Proje ilk çalıştırıldığında otomatik olarak bir admin hesabı oluşturulur:

```
Kullanıcı Adı: @admin
Şifre: 28akm2855
```

**Önemli:** Production ortamında bu şifreyi mutlaka değiştirin!

## 📝 Lisans

MIT License - detaylar için LICENSE dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📧 İletişim

Proje sahibi: [@EchoKatana](https://github.com/EchoKatana)

---

⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!
