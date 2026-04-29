# RAB & ERP Project Management System

Sistem manajemen proyek dan penyusunan Rencana Anggaran Biaya (RAB) yang komprehensif, dirancang untuk efisiensi operasional dan transparansi keuangan proyek Anda.

![Dashboard Preview](public/dashboard-preview.png) *(Opsional: Silakan tambahkan screenshot dashboard di sini)*

## ✨ Keunggulan Utama

Aplikasi ini tidak hanya sekadar pencatatan, melainkan solusi ERP (Enterprise Resource Planning) ringan yang berfokus pada ketepatan biaya:

*   **Monitoring Budget Real-Time**: Lacak selisih antara anggaran rencana (Budget Ceiling) dengan pengeluaran aktual secara instan. Fitur deteksi otomatis **OVERBUDGET** membantu Anda mengantisipasi kerugian lebih awal.
*   **Manajemen Inventori Terintegrasi**: Pantau stok material, pergerakan barang (Masuk/Keluar), hingga peringatan stok minimum dalam satu platform.
*   **Digitalized Approval Workflow**: Tinggalkan tumpukan kertas. Verifikasi pengeluaran dan unggah bukti kuitansi secara digital dengan sistem persetujuan bertingkat (Pending/Approved/Rejected).
*   **Analitik Visual yang Informatif**: Dilengkapi dengan dashboard interaktif menggunakan grafik performa biaya untuk memudahkan pengambilan keputusan strategis.
*   **Arsitektur Modern**: Dibangun di atas stack teknologi terbaru untuk menjamin kecepatan, keamanan, dan skalabilitas.

## 🛠️ Tech Stack

Kami menggunakan teknologi terkini untuk memberikan pengalaman pengguna yang responsif dan performa tinggi:

*   **Frontend**: [Next.js 16](https://nextjs.org/) (App Router) & [React 19](https://react.dev/)
*   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & Modern Vanilla CSS Variables
*   **Database & ORM**: [MySQL](https://www.mysql.com/) dengan [Prisma ORM](https://www.prisma.io/)
*   **Authentication**: [NextAuth.js v5 Beta](https://next-auth.js.org/) (Auth.js)
*   **Data Visualization**: [Recharts](https://recharts.org/)
*   **Processing**: [XLSX](https://github.com/SheetJS/sheetjs) (Excel Export/Import)
*   **Security**: Bcryptjs untuk enkripsi data sensitif

## 🚀 Fitur Utama

Aplikasi ini mencakup modul-modul penting untuk operasional bisnis:

1.  **Dashboard Utama**: Ringkasan performa proyek, estimasi Gross Margin, dan aktivitas terbaru.
2.  **Manajemen Proyek**: Database proyek lengkap dengan detail klien, lokasi, dan item pekerjaan.
3.  **Manajemen Biaya (RAB)**: Penyusunan item biaya per kategori (Material, Upah, Alat, dll).
4.  **Kontrol Inventori**: Katalog material, satuan unit, dan log pergerakan stok.
5.  **Sistem Pengeluaran & Kas**: Pencatatan biaya harian lengkap dengan upload bukti fisik.
6.  **Approval System**: Antarmuka khusus untuk admin/manajer menyetujui atau menolak klaim biaya.
7.  **Database Relasional**: Manajemen Klien dan Supplier (Vendor) yang terorganisir.
8.  **Timeline Proyek**: Visualisasi jadwal pelaksanaan proyek.

## ⚙️ Persiapan & Instalasi

### 1. Prasyarat
*   Node.js 20+
*   MySQL Database

### 2. Konfigurasi Environment
Buat file `.env` di root direktori:
```env
DATABASE_URL="mysql://username:password@localhost:3306/nama_database"
AUTH_SECRET="your-secret-key"
```

### 3. Instalasi
```bash
# Install dependensi
npm install

# Setup database (Prisma)
npx prisma generate
npx prisma db push

# Jalankan seeder (Optional - untuk data awal)
npm run seed
```

### 4. Jalankan Aplikasi
```bash
npm run dev
```
Buka [http://localhost:3001](http://localhost:3001) di browser Anda.

---

**RAB-ERP** — *Membangun dengan data, mengelola dengan presisi.*
