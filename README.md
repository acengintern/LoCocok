# 🚀 LOCO TRACK - Creative Agency Project & Production Management Platform

Platform manajemen proyek kreatif dan alur kerja produksi agensi berbasis web terintegrasi. Menggabungkan frontend modern **Next.js 16 (React 19)** dengan backend REST API yang tangguh berbasis **Laravel 13**.

---

## 📌 Daftar Isi
1. [Fitur Utama yang Tersedia](#-fitur-utama-yang-tersedia)
2. [Tech Stack](#-tech-stack)
3. [Struktur Direktori](#-struktur-direktori)
4. [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
   - [Setup Backend (Laravel 13 API)](#1-setup-backend-laravel-13-api)
   - [Setup Frontend (Next.js 16)](#2-setup-frontend-nextjs-16)
5. [Daftar Akun & Role Default](#-daftar-akun--role-default)
6. [API Endpoints Overview](#-api-endpoints-overview)
7. [Git Workflow](#-git-workflow)

---

## ✨ Fitur Utama yang Tersedia

### 🔐 1. Authentication, Security & RBAC
- **Hybrid Login System**:
  - Login manual menggunakan Email/Username + Password.
  - Login instan menggunakan **Google SSO (OAuth 2.0)**.
- **Role-Based Access Control (RBAC)** menggunakan Spatie Laravel Permission:
  - *System Administrator*, *Creative Director*, *Account Executive*, *Social Media Specialist*, *Graphic Designer*, *Video Editor / DAV*, *KOL*, dan *Production Assistant*.
- **Role & Permissions Matrix**: Pengaturan hak akses dinamis (view, create, edit, delete, assign, upload, approve, publish, export, manage).
- **User Profile & Security**:
  - Edit identitas profil & foto avatar (dengan gradient dynamic avatar fallback).
  - Ganti password dengan proteksi password lama (dilewati otomatis jika akun dibuat via Google SSO).
  - Statistik kontribusi personal (total projects, active tasks, approval queue).

### 📊 2. Executive Dashboard
- **KPI Summary Cards**: Total active projects, task completion rate, pending approvals, team utilization rate.
- **Studio Velocity Card**: Metrik kecepatan pengerjaan output deliverable & target efisiensi tim.
- **Workload Capacity Chart**: Grafik visual kapasitas tim vs beban kerja aktif secara real-time.
- **Output Deliverables Status**: Distribusi status deliverable (Draft, In Progress, Client Review, Approved, Published).
- **Project Status Distribution**: Donut & bar breakdown status proyek.
- **Recent Projects & Quick Actions**: Shortcut cepat menuju proyek terbaru.

### 📁 3. Project Management
- **Central Project Directory**: Tabel proyek terintegrasi dengan filter kategori, status, tanggal, dan AE.
- **Project Views**:
  - **List View**: Tampilan tabel komprehensif.
  - **Calendar View**: Kalender interaktif (FullCalendar) untuk jadwal proyek dan tenggat waktu.
  - **My Projects Filter**: Filter otomatis khusus proyek yang melibatkan user yang sedang login.
- **Project Detail Page (Modular Tabs)**:
  - 📋 **Content Planning Tab**: Manajemen brief, perumusan content plan bulanan, scriptwriting, dan jadwal tayang.
  - 📄 **Contracts Tab**: Unggah dokumen kontrak, nomor P.O, nilai kontrak, status penandatanganan, dan tanggal berlaku.
  - 📂 **Files & Asset Tab**: Manajemen file multi-versi, status review file, download aman, dan riwayat revisi.
  - 💰 **Financial Tab**: Breakdown estimasi budget, tracking pemasukan/pembayaran termin, pencatatan biaya operasional, dan kalkulasi profit margin.
  - 🎯 **Outputs Tab**: Tracking item deliverable akhir (video reels, feed post, carousel, banner, dsb.) lengkap dengan format dan tenggat.
  - 🔨 **Tasks Tab**: Daftar sub-task spesifik proyek, assignees, bobot kerja, dan status penyelesaian.

### ⚡ 4. Production & Operations
- **Task Management**: Daftar tugas global lintas proyek dengan filter status, prioritas, dan assignee.
- **Kanban Production Board**: Papan alur kerja visual interaktif Drag & Drop (Backlog ➔ In Progress ➔ In Review ➔ Completed).
- **Team Workload & Capacity Planner**: Monitoring beban kerja per divisi/anggota tim agar tidak terjadi *overload*.
- **Additional Load**: Tracking tugas dadakan atau revisi tambahan di luar *scope of work* awal.
- **Approval Queue**: Halaman terpusat untuk Lead / Creative Director menyetujui deliverable, memberikan catatan revisi, atau menolak aset.

### 📝 5. Content Operations
- **Briefs**: Input dan kelola brief kreatif dari klien.
- **Content Plan**: Kalender konten media sosial per akun klien.
- **Scripts**: Review naskah video/audio dengan status approval.
- **Published Content**: Arsip dan pemantauan konten yang telah tayang di kanal publik.

### ⚙️ 6. Administration & Master Data Hub
- **User Management**: Tambah/edit pengguna, suspend akun, pemulihan akun *soft-deleted*, dan assignment peran ganda.
- **Clients Directory**: Manajemen data klien, brand, PIC, kontak, dan daftar proyek terkait.
- **Master Data Hub**:
  - *Project Types* (Social Media, Campaign, Video Production, Branding, etc.)
  - *Task Types* (Copywriting, Video Editing, Shooting, Motion Graphic, etc.)
  - *Output Types* (Reels, TikTok, Static Post, Carousel, Story, etc.)
  - *File Types* (Master Video, Raw Footage, PDF Brief, Preview Draft, etc.)
  - *Teams / Divisions* (Creative, Design, Video, AE, Social Media)
- **System Settings**: Konfigurasi global agensi, nama platform, working hours, auto-approval threshold, dsb.
- **Audit Logs / Activity Log**: Rekaman riwayat aktivitas seluruh aksi pengguna (siapa, apa yang diubah, kapan) untuk transparansi.

### 🎨 7. UI/UX & Quality of Life
- **Dark Mode & Light Mode**: Toggle tema adaptif dengan penyimpanan preferensi otomatis.
- **Toast Notifications System**: Notifikasi feedback visual untuk setiap aksi CRUD.
- **Real-time Notification Bell**: Badge jumlah notifikasi unread dan drawer notifikasi.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS v4
- **Charts & Calendar**: ApexCharts, FullCalendar (Core, DayGrid, TimeGrid, List, Interaction)
- **Drag and Drop**: React DnD (HTML5 Backend)
- **HTTP Client**: Axios dengan Interceptor Token & Auto Sanctum CSRF

### Backend
- **Framework**: [Laravel 13](https://laravel.com/)
- **Runtime**: PHP >= 8.3
- **Authentication**: Laravel Sanctum (Token & SPA Cookie Auth), Laravel Socialite (Google SSO)
- **Authorization & Audit**: Spatie Laravel Permission & Spatie Activitylog
- **Database Support**: MySQL (Rekomendasi Produksi) / SQLite (Development)

---

## 📂 Struktur Direktori

```text
web-track-nextjs/
├── backend/                  # Laravel 13 REST API
│   ├── app/
│   │   ├── Enums/            # ApprovalStatus, ProjectStatus, ClientStatus, etc.
│   │   ├── Http/Controllers/ # Auth, GoogleAuth, Projects, Tasks, Dashboard, etc.
│   │   ├── Models/           # Eloquent Models (Project, Task, Client, User, etc.)
│   │   └── Policies/         # Authorization policies
│   ├── config/               # Sanctum, Cors, Auth, Services
│   ├── database/
│   │   ├── migrations/       # Skema database lengkap
│   │   └── seeders/          # RolePermission, Setting, MasterData Seeders
│   └── routes/
│       └── api.php           # API Endpoints v1
├── frontend/                 # Next.js 16 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── (admin)/      # Halaman aplikasi utama (Dashboard, Projects, dsb.)
│   │   │   └── (auth)/       # Halaman Sign In, Sign Up, Google Callback
│   │   ├── components/       # Reusable UI, Layout, Modals, Tables, Charts
│   │   ├── contexts/         # AuthContext, ThemeContext, ToastContext, SettingsContext
│   │   ├── hooks/            # useAuth, useSettings, useModal
│   │   ├── lib/api/          # Axios instance & API client
│   │   └── types/            # TypeScript interfaces & types
├── .gitignore                # Aturan ignore monorepo
└── README.md                 # Dokumentasi proyek ini
```

---

## 🚀 Panduan Instalasi & Menjalankan

### Persyaratan Sistem
Pastikan telah menginstal:
- **Node.js**: v20.x atau lebih tinggi (npm / pnpm / yarn)
- **PHP**: v8.3 atau lebih tinggi
- **Composer**: v2.x
- **Database**: MySQL 8.x / MariaDB / SQLite

---

### 1. Setup Backend (Laravel 13 API)

1. **Buka terminal dan masuk ke folder `backend`**:
   ```bash
   cd backend
   ```

2. **Instal dependensi PHP**:
   ```bash
   composer install
   ```

3. **Duplikat file environment**:
   ```bash
   cp .env.example .env
   ```

4. **Generate Application Key**:
   ```bash
   php artisan key:generate
   ```

5. **Konfigurasi Database di file `.env`**:
   Untuk MySQL:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=loco_track
   DB_USERNAME=root
   DB_PASSWORD=
   ```
   *(Atau gunakan SQLite dengan membuat file `database/database.sqlite` dan set `DB_CONNECTION=sqlite`)*

6. **Konfigurasi Google SSO & CORS di `.env`**:
   ```env
   APP_URL=http://localhost:8000
   FRONTEND_URL=http://localhost:3000
   SANCTUM_STATEFUL_DOMAINS=localhost:3000
   CORS_ALLOWED_ORIGINS=http://localhost:3000

   # Google OAuth (Opsional untuk fitur Google Login)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback
   ```

7. **Jalankan Migrasi dan Database Seeder**:
   ```bash
   php artisan migrate --seed
   ```

8. **Jalankan Server Backend**:
   ```bash
   php artisan serve --port=8000
   ```
   *Backend API berjalan di:* `http://localhost:8000`

---

### 2. Setup Frontend (Next.js 16)

1. **Buka terminal baru dan masuk ke folder `frontend`**:
   ```bash
   cd frontend
   ```

2. **Instal dependensi Node**:
   ```bash
   npm install
   ```

3. **Buat file environment `.env.local`**:
   Buat file `.env.local` di dalam folder `frontend` dengan isi:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   *Frontend web berjalan di:* `http://localhost:3000`

5. **Buka di Browser**:
   Kunjungi [http://localhost:3000](http://localhost:3000) dan login ke aplikasi.

---

## 👥 Daftar Akun & Role Default

Setelah menjalankan `php artisan migrate --seed`, akun pengujian berikut tersedia di database:

| Role | Email / Username | Password Default | Akses |
|---|---|---|---|
| **System Administrator** | `admin@locotrack.com` / `admin` | `password` | Akses Penuh ke Seluruh Fitur & Master Data |
| **Creative Director** | `director@locotrack.com` / `director` | `password` | Approval Deliverable, Brief, Script, Task Assignment |
| **Account Executive** | `ae@locotrack.com` / `ae_user` | `password` | Buat Proyek, Client Management, Kontrak, Financial |
| **Team Member / Designer** | `designer@locotrack.com` / `designer` | `password` | Eksekusi Task, Upload File/Revisi, Board View |

---

## 📡 API Endpoints Overview

Semua endpoint backend diawali dengan prefix `/api/v1`:

| Kategori | Endpoint | Method | Keterangan |
|---|---|---|---|
| **Health** | `/api/v1/ping` | `GET` | Health check endpoint |
| **Auth** | `/api/v1/login` | `POST` | Login dengan email/username |
| **Auth** | `/api/v1/logout` | `POST` | Logout & revoke token |
| **Auth** | `/api/v1/me` | `GET` | Data user login & roles |
| **Google SSO**| `/api/v1/auth/google/redirect` | `GET` | Redirect ke Google OAuth consent |
| **Google SSO**| `/api/v1/auth/google/exchange` | `POST` | Exchange auth code ke API token |
| **Dashboard**| `/api/v1/dashboard/summary` | `GET` | KPI Summary metrics |
| **Dashboard**| `/api/v1/dashboard/workload` | `GET` | Data grafik kapasitas & beban tim |
| **Projects** | `/api/v1/projects` | `GET, POST` | List & buat proyek baru |
| **Projects** | `/api/v1/projects/{id}` | `GET, PUT, DELETE` | Detail, update, & hapus proyek |
| **Contracts**| `/api/v1/projects/{id}/contracts` | `GET, POST` | Manajemen kontrak proyek |
| **Outputs**  | `/api/v1/projects/{id}/outputs` | `GET, POST` | Manajemen deliverable output |
| **Tasks**    | `/api/v1/tasks` | `GET` | Daftar tugas global |
| **Tasks**    | `/api/v1/projects/{id}/tasks` | `GET, POST` | Tugas spesifik proyek |
| **Files**    | `/api/v1/projects/{id}/files` | `GET, POST` | Upload & manajemen aset |
| **Approvals**| `/api/v1/{target}/{id}/approvals`| `GET, POST` | Approval & approval log |
| **Master**   | `/api/v1/master/{resource}` | `GET, POST, PUT, DELETE` | CRUD Project, Task, Output, File Types & Teams |
| **Audit**    | `/api/v1/activity-logs` | `GET` | Audit log aktivitas sistem |

---

## 🌿 Git Workflow

- **Branch `main`**: Branch rilis produksi yang stabil.
- **Branch `dev-aceng`**: Branch aktif untuk penambahan fitur dan pengembangan harian.

Untuk push perubahan terbaru:
```bash
git add .
git commit -m "feat(scope): deskripsi perubahan"
git push origin dev-aceng
```

---

<p align="center">
  <b>LOCO TRACK</b> &bull; Creative Agency Project & Production Management
</p>
