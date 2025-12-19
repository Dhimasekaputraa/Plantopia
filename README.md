# Plantopia

## Panduan Instalasi

### 5.1 Persyaratan Sistem

Untuk dapat menjalankan web ini di komputer lokal, maka terdapat beberapa persyaratan yang perlu dipenuhi:

1. **Web Browser** - seperti Chrome atau Firefox
2. **Git** - digunakan untuk melakukan clone ke komputer lokal
3. **NodeJs** - LTS versi 18.x atau 20.x termasuk NPM
4. **SQLite3** - sebagai basis data yang digunakan pada lingkungan pengembangan

### 5.2 Panduan Instalasi

Berikut merupakan langkah-langkah untuk menjalankan web pada perangkat lokal:

#### 1. Clone Repository

Pastikan git sudah terinstall (periksa dengan menjalankan `git --version`).

Ketik pada terminal:
```bash
git clone https://github.com/Dhimasekaputraa/Plantopia.git
```

#### 2. Pindah ke Folder Plantopia

Ketik pada terminal:
```bash
cd Plantopia
```

#### 3. Install Dependensi dari NodeJs

Pastikan node dan npm sudah terinstall (cek dengan `node --version` dan `npm --version`).

Selanjutnya ketik pada terminal:
```bash
npm install
```

#### 4. Buat File .env

Copy file `.example.env` untuk membuat file `.env`. Ketik pada terminal:
```bash
cp .example.env .env
```

#### 5. Generate App Key

Isi app_key untuk file `.env` dengan cara mengetikkan:
```bash
node ace generate:key
```

#### 6. Buat Folder tmp untuk Database

Di dalam folder Plantopia (lokasi saat ini) buat folder baru bernama `tmp`.

#### 7. Jalankan Migration dan Seed

Ketik baris perintah berikut pada terminal:
```bash
node ace migration:run
```

Kemudian jalankan:
```bash
node ace db:seed
```

#### 8. Jalankan Web

Ketik pada terminal:
```bash
npm run dev
```

Buka browser dan akses aplikasi di:
```
http://localhost:3333
```

Atau klik pada server address yang muncul di terminal.