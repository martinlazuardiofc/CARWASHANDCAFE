# ASIA CAR WASH & CAFE
### Digital Menu, Online Ordering & Administrator Management System

Website full-stack profesional, modern, dan premium untuk **ASIA Car Wash & Cafe**. Mengintegrasikan sistem digital menu mobile-first untuk pelanggan via QR Code meja, sistem pemesanan online, customer membership opsional, dashboard administrasi bisnis lengkap, serta modul integrasi kasir (`kasirAdapter`).

---

## 1. Brand Identity & Visual Concept

- **Nama Bisnis:** ASIA Car Wash & Cafe
- **Konsep Visual:** *European Luxury Cafe meets Modern Automotive Lounge*
- **Identitas Warna Utama:**
  - Navy Dark: `#0F2342`
  - Gold Accent: `#D4AF6A`
  - Cream Text: `#F5E9C8`
  - Palet Pelengkap: `#38271F`, `#684832`, `#F5EBDD`
- **Tipografi:** Serif elegan (*Playfair Display*) untuk heading & Sans-serif modern (*Plus Jakarta Sans*) untuk teks konten.
- **Logo Brand:** Tulisan "ASIA" dengan bintang kecil di ujung atas dan siluet mobil mewah di atasnya, dilengkapi ornamen daun/laurel bergaya cafe mewah Eropa.
- **Tagline:** *"A Taste of Comfort, A Touch of Luxury."*

---

## 2. Akun Administrator Default

Sistem telah di-seed dengan akun Owner default sesuai spesifikasi:

| Role | Email / Gmail | Password | Akses |
|---|---|---|---|
| **OWNER** | `asiacarandwashcafe@gmail.com` | `asiacafe1*` | Full akses seluruh fitur, staff, kasir, laporan, audit log, diskon & menu |
| **STAFF** | `staff@asiacafe.com` | `asiastaff123` | Melihat pesanan, mengubah status pesanan, ketersediaan produk, kitchen display |

---

## 3. Fitur Utama

### A. Pengalaman Pelanggan (Customer Mobile-First Website)
1. **Hero Intro Opening Animation:**
   - Animasi opening elegan dengan background navy gelap, logo ASIA, animasi mobil & bintang, tagline, garis emas, dan tombol *"Explore Our Menu"*.
   - Dilengkapi tombol *Lewati (Skip)* dan tersimpan di session/local storage serta menghormati `prefers-reduced-motion`.
2. **Beranda & Suasana Cafe:**
   - Banner hero, menu unggulan, informasi layanan car wash (Snow Wash Hidrolik, Interior Vacuum, Glass Water-Spot Treatment, Body Waxing), jam operasional, tautan Instagram `@asiacarwashandcafe`, dan tombol lokasi Google Maps.
   - Pengumuman penting yang diatur administrator secara live.
3. **Digital Menu & Pencarian:**
   - Navigasi kategori sticky.
   - Carousel menu unggulan berfoto besar.
   - Pencarian instan dan filter kategori, rentang harga, serta label (*Best Seller*, *Recommended*, *Spicy*, *New*).
   - Bottom sheet detail produk: varian Hot/Cold (Kopi, Non-Coffee, Tea), add-ons (Extra Shot, Gula Aren, Oat Milk, Mayo, Sambal Matah, Sambal Ijo, Rice), catatan khusus, dan jumlah pesanan.
4. **Floating Cart & Checkout:**
   - Floating cart di bagian bawah layar handphone dengan indikator jumlah dan total harga.
   - Formulir checkout: nama pemesan (wajib), nomor WhatsApp, plat nomor kendaraan (opsional), pilihan meja (Meja 01–23, Meja VIP Room, Area Tunggu / Car Wash), dan catatan umum.
   - **QR Code Auto-Detection:** Akses via URL `/m/[table]` (contoh: `/m/12` atau `/m/VIP`) otomatis mengisi dan mengunci lokasi meja pemesan!
   - Perhitungan harga, diskon, dan pajak/service 11% divalidasi ulang di backend.
5. **Pembayaran & Simulasi Gateway:**
   - Pilihan: Bayar di Kasir, QRIS, Transfer Bank (Virtual Account), Kartu Debit/Kredit.
   - Halaman pembayaran digital dengan QRIS generator dan tombol simulasi pembayaran sukses instan untuk pengujian.
6. **Live Order Tracking (`/orders/[order_id]`):**
   - Pelacakan status real-time 5 tahap: **Diterima → Diproses → Siap → Diantar → Selesai**.
   - Tombol **"Panggil Pelayan"** dan **"Minta Bill"** dengan modal konfirmasi dan proteksi anti-spam.
   - Tombol **"Pesan Tambahan di Meja Ini"** tanpa menghilangkan pesanan sebelumnya.
7. **Customer Membership (Opsional):**
   - Registrasi, Login, Profil, dan Riwayat Transaksi.
   - Pelanggan tetap dapat memesan sebagai Guest tanpa harus login.

---

### B. Pengalaman Administrator (Admin Management Dashboard)
1. **Dashboard Overview:**
   - Metrik KPI: Total pesanan hari ini, total omzet lunas, omzet bruto, pesanan menunggu, pesanan diproses, pesanan selesai, dan jumlah member.
   - Grafik tren omzet 7 hari & 30 hari.
   - Menu terlaris dan pemantauan jam operasional.
   - Daftar pesanan real-time dengan notifikasi suara (*audio chime*) dan tombol aksi cepat ganti status.
   - Peringatan pesanan gagal sinkron ke kasir dan tombol *Kirim Ulang (Retry)*.
2. **Kitchen & Barista Display (`/admin/kitchen-display`):**
   - Layar tiket pesanan langsung untuk koki dan barista dengan kartu visual yang jelas dan pembaruan berkala.
3. **Manajemen Produk (CRUD Lengkap):**
   - Tambah, Edit, Soft Delete, dan Restore produk.
   - Atur nama, kategori, harga, deskripsi, upload foto, status tersedia/habis, menu unggulan, varian, add-ons, diskon persentase/nominal, label, dan SKU kasir.
   - Flag khusus *Draft/Perlu Konfirmasi Harga* untuk item *Nasi Goreng Oseng Buntut Asia* dan *Es Buah*.
4. **Manajemen Kategori:**
   - Tambah, edit, ubah urutan, dan aktif/nonaktifkan kategori.
5. **Manajemen Meja & QR Code:**
   - Total 23 meja reguler + 1 meja VIP Room + 1 Area Tunggu / Car Wash.
   - Generate unik QR Code URL (`/m/12`, `/m/VIP`, `/m/CARWASH`).
   - Unduh file PNG QR Code.
   - Pratinjau dan cetak kartu QR Code meja bergaya *European luxury frame* dengan instruksi *"Scan to Order"*.
6. **Manajemen Promosi & Pengumuman:**
   - Pengaturan banner promo, tipe diskon (persentase/nominal), target kategori/produk.
   - Pengaturan pengumuman penting yang tampil di homepage customer.
7. **Galeri Suasana & Car Wash:**
   - Kelola foto atmosfer cafe, car wash bay, dan VIP dining room.
8. **Laporan Penjualan (Reports):**
   - Laporan omzet, pesanan, rata-rata belanja per pesanan (AOV), menu terlaris, produk kurang laku (*slow moving*), breakdown metode pembayaran, dan penjualan per meja.
   - Fitur filter rentang tanggal dan tombol **Export CSV**.
9. **Manajemen Staff & Role (Owner Only):**
   - Buat akun staff baru, ubah role (*OWNER* / *STAFF*), reset password, dan hapus staff.
10. **Pengaturan Bisnis (Settings):**
    - Konfigurasi tarif pajak/layanan (default 11%).
    - Toggle aktivasi metode pembayaran (Kasir, QRIS, Transfer, Debit, Kredit).
    - Jam operasional cafe & car wash, nomor hotline, dan tautan sosial media.
11. **Modul Integrasi Kasir (`kasirAdapter`):**
    - Konfigurasi API URL, API Key, Auth Type, dan Webhook Secret.
    - Format JSON pesanan sesuai spesifikasi dengan SKU kasir dan idempotency key.
    - Webhook receiver di `/api/webhook/kasir` dengan validasi HMAC signature.
    - Fitur uji coba sinyal webhook langsung dari dashboard.
    - Log sinkronisasi lengkap dan antrean retry manual.
12. **Audit Trail (Audit Logs):**
    - Rekam jejak seluruh perubahan data, perubahan harga, penghapusan produk, dan pembaruan pengaturan dengan waktu dan identitas user.

---

## 4. Struktur Database & Seed Data

Sistem menggunakan SQLite relasional berkekuatan tinggi (`node:sqlite` bawaan Node.js v22) yang memiliki performa instan, zero external dependency, dan mendukung foreign key serta WAL mode.

### Database Schema:
- `users`: ID, nama, email, password_hash, role (`OWNER`/`STAFF`), timestamps.
- `customer_accounts`: ID, nama, email, phone, password_hash, timestamps.
- `categories`: 15 Kategori resmi (Salad, Rice Bowl, Signature, Noodle, Western, Snack & Dessert, Additional Food, Kopi, Non-Coffee, Tea, Coffee Mocktail, Mocktail, Juice, Water, Additional Drink).
- `menu_items`: Seluruh 55+ menu resmi dari spesifikasi dengan foto, harga, status unggulan, diskon, label, dan flag konfirmasi.
- `menu_variants`: Varian Hot & Cold untuk Kopi, Non-Coffee, dan Tea.
- `addons`: 7 add-ons resmi (Espresso Extra Shot, Gula Aren, Oat Milk, Dressing Mayo, Sambal Matah, Sambal Ijo, Rice).
- `menu_item_addons`: Relasi banyak-ke-banyak antara produk dan add-on.
- `promotions`: Banner promosi aktif dan diskon.
- `tables`: Meja 01–23, Meja VIP Room, Area Tunggu / Car Wash lengkap dengan token QR.
- `orders`: Header pesanan, nomor pesanan unik (`ORD-YYYYMMDD-XXXX`), customer info, meja, subtotal, diskon, pajak 11%, total, status pembayaran, dan status pesanan.
- `order_items`: Snapshot nama produk, snapshot harga satuan, kuantitas, snapshot varian, snapshot add-ons, dan catatan.
- `order_status_logs`: Riwayat perubahan status pesanan.
- `service_calls`: Panggilan pelayan dan permintaan bill dengan proteksi anti-spam.
- `payments`: Riwayat pembayaran gateway.
- `kasir_sync_logs`: Catatan sinkronisasi HTTP POST kasir eksternal dan retry counter.
- `settings`: Pengaturan bisnis dan integrasi.
- `audit_logs`: Audit trail administrator.
- `gallery_items`: Foto galeri cafe dan car wash.

---

## 5. Struktur Folder Proyek

```
/home/user/CARWASHANDCAFE/
├── data/
│   └── carwashandcafe.db         # Database SQLite file
├── public/
│   └── uploads/                  # Foto produk yang diunggah
├── scripts/
│   └── seed.js                   # CLI seed database script
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (customer routes)
│   │   │   ├── page.tsx          # Homepage dengan Hero Intro & Banner
│   │   │   ├── menu/page.tsx     # Menu digital, sticky categories, filter
│   │   │   ├── cart/page.tsx     # Keranjang belanja & rincian harga
│   │   │   ├── checkout/page.tsx # Form checkout & pemilihan meja
│   │   │   ├── payment/page.tsx  # Halaman pembayaran QRIS/VA & simulasi
│   │   │   ├── orders/[id]/...   # Order tracking real-time & panggil pelayan
│   │   │   ├── orders/track/...  # Pencarian nomor pesanan
│   │   │   ├── account/page.tsx  # Profil pelanggan & riwayat pesanan
│   │   │   ├── login/page.tsx    # Login pelanggan
│   │   │   ├── register/page.tsx # Registrasi pelanggan
│   │   │   └── m/[table]/...     # QR Code scanner entry point
│   │   ├── admin/                # Admin Panel
│   │   │   ├── layout.tsx        # Layout admin dengan otorisasi & sidebar
│   │   │   ├── login/page.tsx    # Login admin
│   │   │   ├── dashboard/...     # Dashboard KPIs, chart, live order list
│   │   │   ├── products/page.tsx # CRUD produk lengkap & soft delete
│   │   │   ├── categories/...    # CRUD kategori
│   │   │   ├── orders/page.tsx   # Kelola pesanan & cetak bill thermal
│   │   │   ├── kitchen-display/  # Layar pesanan dapur & barista
│   │   │   ├── tables/page.tsx   # Meja, QR Code generator & kartu cetak
│   │   │   ├── promotions/...    # Banner promo & pengumuman homepage
│   │   │   ├── gallery/page.tsx  # Galeri cafe & car wash
│   │   │   ├── reports/page.tsx  # Laporan omzet & export CSV
│   │   │   ├── customers/...     # Daftar member pelanggan
│   │   │   ├── staff/page.tsx    # Manajemen staff & role (Owner only)
│   │   │   ├── settings/page.tsx # Pengaturan bisnis & metode bayar
│   │   │   ├── integrations/...  # kasirAdapter & webhook tester
│   │   │   └── audit-logs/...    # Audit trail
│   │   └── api/                  # Backend REST API Routes
│   │       ├── auth/             # Admin & customer auth (JWT httpOnly)
│   │       ├── products/         # Product endpoints
│   │       ├── categories/       # Category endpoints
│   │       ├── addons/           # Addon endpoints
│   │       ├── promotions/       # Promotion endpoints
│   │       ├── tables/           # Table & QR endpoints
│   │       ├── orders/           # Order creation & status
│   │       ├── payments/         # Payment simulation
│   │       ├── reports/          # Sales reports & CSV
│   │       ├── settings/         # Business settings
│   │       ├── audit-logs/       # Audit trail
│   │       ├── upload/           # Photo upload
│   │       └── webhook/          # Kasir & payment webhooks
│   ├── components/
│   │   ├── brand/                # Logo ASIA, Hero Intro Animation
│   │   ├── customer/             # Floating Cart, Bottom Nav, Product Sheet
│   │   └── admin/                # Admin Sidebar & Header
│   ├── context/
│   │   └── CartContext.tsx       # State keranjang, meja & localStorage sync
│   ├── lib/
│   │   ├── db.ts                 # Database connection & schema
│   │   ├── auth.ts               # JWT & bcrypt authentication
│   │   ├── kasirAdapter.ts       # Modul integrasi kasir & webhook validator
│   │   └── seed.ts               # Database seed logic
│   └── types/
│       └── sqlite.d.ts           # Type definitions
├── .env.example                  # Environment variables template
├── package.json
├── tailwind.config.ts            # Brand colors & luxury styling
└── tsconfig.json
```

---

## 6. Panduan Instalasi & Menjalankan Proyek

### Prasyarat
- Node.js versi 18 atau 22 (direkomendasikan Node.js v22).
- NPM versi 9+.

### Langkah-langkah:
1. **Clone repository dan masuk ke direktori:**
   ```bash
   cd /home/user/CARWASHANDCAFE
   ```

2. **Pasang dependensi:**
   ```bash
   npm install
   ```

3. **Inisialisasi Database & Seeding Data Menu:**
   ```bash
   npm run seed
   ```

4. **Konfigurasi Environment Variables:**
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```

5. **Build dan Jalankan Production Server:**
   ```bash
   npm run build
   npm run start
   ```
   Aplikasi akan berjalan pada `http://0.0.0.0:3000`.

---

## 7. Format Payload Integrasi Kasir (`kasirAdapter`)

Saat pesanan dibuat, sistem mengirimkan payload JSON berikut ke `KASIR_API_URL`:

```json
{
  "order_id": "ORD-20261117-0001",
  "location": "Meja 12",
  "customer_name": "Budi Santoso",
  "vehicle_plate": "B 1234 ASI",
  "created_at": "2026-11-17T10:30:00+07:00",
  "items": [
    {
      "menu_id": "menu-sig-01",
      "kasir_product_id": "SKU-SIG-001",
      "name": "Nasi Sop Buntut Asia",
      "qty": 1,
      "price": 90000,
      "options": [],
      "note": "Kuah panas"
    },
    {
      "menu_id": "menu-kop-06",
      "kasir_product_id": "SKU-KOP-006",
      "name": "Kopi Susu Gula Aren",
      "qty": 2,
      "price": 38000,
      "options": ["Cold", "Espresso Extra Shot"],
      "note": "Gula aren sedikit"
    }
  ],
  "total": 184260,
  "payment_method": "cashier",
  "payment_status": "unpaid",
  "notes": "Tolong cepat ya, sedang cuci mobil"
}
```

Endpoint Webhook Penerima Status Kasir:
- URL: `POST /api/webhook/kasir`
- Header: `X-Kasir-Signature: <hmac_sha256_hex>`

---

## 8. Verifikasi & Pengujian Fitur

Seluruh fitur telah melalui pengujian menyeluruh:
- Customer homepage, digital menu, dan filter kategori/harga: **Berfungsi Normal**.
- Bottom sheet detail produk, varian Hot/Cold, dan add-ons: **Berfungsi Normal**.
- Keranjang belanja floating dan sinkronisasi localStorage: **Berfungsi Normal**.
- QR Code Meja (`/m/[table]`): **Otomatis mengisi nomor meja dan redirect ke menu**.
- Validasi harga dan perhitungan pajak 11% di backend: **Berfungsi Akurat**.
- Live tracking pesanan dan tombol panggil pelayan/minta bill: **Berfungsi Real-Time**.
- Otentikasi Administrator (`asiacarandwashcafe@gmail.com` / `asiacafe1*`): **Terverifikasi**.
- CRUD produk, kategori, promosi, dan galeri: **Terhubung langsung ke database**.
- Cetak bill thermal 80mm dan ekspor CSV laporan penjualan: **Teruji & Siap Digunakan**.
