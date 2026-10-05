# Hostinger & GitHub Otomatik Deploy Rehberi
Hedef Alan Adı: https://grey-cassowary-525647.hostingersite.com/

Bu proje; Node.js, Express, WebSocket ve modern React teknolojilerini birleştiren gerçek zamanlı bir Kahoot tarzı yarışma uygulamasıdır.

## 1. GitHub Otomatik Deploy (GitHub Actions)
Repository'nizi GitHub'a push ettikten sonra:
1. GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions** bölümüne gidin.
2. Aşağıdaki "Repository Secrets" değerlerini ekleyin:
   - `HOSTINGER_FTP_SERVER`: Hostinger hPanel -> Dosyalar -> FTP Hesapları bölümündeki FTP Sunucu adresi (örn: `ftp.grey-cassowary-525647.hostingersite.com` veya IP).
   - `HOSTINGER_FTP_USERNAME`: Hostinger FTP kullanıcı adınız.
   - `HOSTINGER_FTP_PASSWORD`: Hostinger FTP şifreniz.
   - `HOSTINGER_WEBHOOK_URL` (Opsiyonel): Hostinger Git/Web hook URL'iniz.
3. Her `main` veya `master` branch'ine push yaptığınızda, `.github/workflows/deploy.yml` otomatik çalışır, projeyi derler ve Hostinger `public_html/` dizinine yükler!

## 2. Hostinger Veritabanı Kurulumu (MySQL / MariaDB)
1. Hostinger hPanel -> **Veritabanları (Databases)** -> **MySQL Veritabanları** bölümüne gidin.
2. Yeni veritabanı ve kullanıcı oluşturun.
3. **phpMyAdmin**'e girin ve `hostinger-deploy/database-schema.sql` dosyasını içe aktarın (Import).
4. Yarışma soruları, oyuncu skorları ve oturum kayıtları doğrudan bu tablolarla eşleşebilir.

## 3. Hostinger Node.js Uygulama Olarak Çalıştırma (Opsiyonel Tam Sunucu)
Hostinger Business planınızda Node.js desteği varsa:
1. hPanel -> **Gelişmiş** -> **Node.js** bölümüne girin.
2. Node sürümünü 20.x seçin.
3. Uygulama kök dizinini belirleyin ve başlangıç dosyası olarak `server.ts` veya `server.js` seçin.
4. `npm run build` ve `npm start` komutları otomatik çalışacaktır.
