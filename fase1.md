# FASE 1 — FOUNDATION LOCO TRACK

Saya sedang membangun sistem internal perusahaan bernama **LOCO TRACK — Production & Project Management System**.

Saya **SUDAH menyediakan dan meng-install template TailAdmin versi Next.js** sebagai base project. Jangan membuat project Next.js baru dari nol dan jangan mengganti template dengan UI framework lain.

## 1. Tujuan Fase Ini

Pada fase ini, fokus hanya pada **FOUNDATION / PROJECT SETUP**.

Jangan implementasikan fitur bisnis LOCO TRACK terlebih dahulu seperti:

- Project Management
- Task Management
- Content Planning
- Approval
- Workload
- Reports
- Financial
- File Management
- Workflow

Fitur-fitur tersebut akan dikerjakan pada fase berikutnya.

Tujuan Fase 1 adalah memastikan project TailAdmin yang sudah ada menjadi foundation yang rapi, scalable, dan siap dikembangkan menjadi LOCO TRACK.

---

# 2. LANGKAH PERTAMA — AUDIT PROJECT

Sebelum mengubah kode apa pun:

1. Periksa struktur project yang sudah tersedia.
2. Identifikasi:
    - versi Next.js
    - versi React
    - TypeScript
    - Tailwind CSS
    - package manager
    - struktur `app/` atau `pages/`
    - layout TailAdmin
    - sidebar
    - header
    - component system
    - icon system
    - dark mode
    - responsive behavior

3. Identifikasi component yang sudah tersedia dari TailAdmin.
4. Jangan membuat ulang component yang sebenarnya sudah tersedia.
5. Jangan menghapus component bawaan TailAdmin tanpa alasan teknis.
6. Pertahankan konfigurasi TailAdmin yang sudah stabil.

Setelah audit, lakukan perubahan hanya jika memang diperlukan untuk foundation LOCO TRACK.

---

# 3. STACK YANG HARUS DIGUNAKAN

Frontend:

- Next.js
- React
- TypeScript
- Tailwind CSS
- TailAdmin
- ESLint

Backend nantinya:

- Laravel
- REST API
- Laravel Sanctum

Database nantinya:

- MySQL

**Pada Fase 1 belum perlu membuat Laravel atau database.**

Fokus fase ini hanya pada frontend foundation.

---

# 4. STRUKTUR FRONTEND

Siapkan struktur yang scalable untuk aplikasi dashboard enterprise.

Gunakan struktur yang sesuai dengan arsitektur Next.js yang sudah digunakan oleh template TailAdmin.

Target konseptual:

```text
src/
├── app/
│   ├── dashboard/
│   ├── projects/
│   ├── production/
│   ├── content/
│   ├── timeline/
│   ├── reports/
│   ├── files/
│   ├── activity-log/
│   └── administration/
│
├── components/
│   ├── common/
│   ├── layout/
│   ├── dashboard/
│   ├── projects/
│   ├── production/
│   ├── content/
│   ├── reports/
│   └── ui/
│
├── lib/
│   ├── api/
│   ├── auth/
│   └── utils/
│
├── types/
│
├── constants/
│
└── config/
```

Namun **jangan memindahkan struktur TailAdmin secara paksa** jika template menggunakan struktur berbeda.

Prioritaskan kompatibilitas dengan struktur existing project.

---

# 5. ROUTING FOUNDATION

Siapkan route dasar untuk LOCO TRACK.

Minimal:

```text
/dashboard

/projects
/projects/[id]

/production
/production/tasks
/production/workload
/production/additional-load
/production/approval-queue
/production/board

/content
/content/brief
/content/content-plan
/content/script

/timeline

/reports

/files

/activity-log

/administration
/administration/users
/administration/roles
/administration/clients
/administration/teams
/administration/master-data
/administration/settings
```

Untuk saat ini halaman boleh berupa **placeholder yang rapi**, bukan implementasi fitur.

Contoh:

```text
Projects
Coming in Phase 7
```

Tetapi jangan menggunakan placeholder yang terlihat seperti halaman rusak.

Gunakan layout TailAdmin secara konsisten.

---

# 6. DASHBOARD LAYOUT

Gunakan layout utama TailAdmin sebagai shell aplikasi.

Pastikan tersedia:

```text
Sidebar
Header
Main Content
Breadcrumb bila diperlukan
Responsive Mobile Navigation
```

Sidebar harus menjadi foundation navigasi LOCO TRACK.

Struktur menu awal:

```text
Dashboard

Projects
├── All Projects
├── My Projects
├── Create Project
└── Project Calendar

Production
├── All Tasks
├── My Tasks
├── Daily Workload
├── Additional Load
├── Approval Queue
└── Production Board

Content
├── Brief
├── Content Plan
├── Script / Ideation
├── Design
├── Video
└── Published Content

Timeline
├── Project Timeline
├── Task Timeline
└── Calendar

Reports

Files

Activity Log

Administration
├── Users
├── Roles & Permissions
├── Clients
├── Teams
├── Output Types
├── Status
└── System Settings
```

Struktur ini mengikuti kebutuhan LOCO TRACK dalam dokumen analisis sistem.

Jangan membuat semua submenu menjadi fitur aktif. Untuk Fase 1 cukup routing dan navigation foundation.

---

# 7. DESIGN SYSTEM

Gunakan TailAdmin sebagai basis visual.

Jangan mengubah design system secara ekstrem.

Tetapkan prinsip:

- clean
- professional
- enterprise dashboard
- modern
- data-oriented
- responsive
- consistent spacing
- consistent typography
- consistent border radius
- consistent card
- consistent table
- consistent button
- consistent form
- consistent modal

Hindari:

- gradient berlebihan
- glassmorphism berlebihan
- animasi berlebihan
- card yang terlalu dekoratif
- layout dashboard yang terlalu penuh
- warna random
- inline styling yang tidak diperlukan

LOCO TRACK adalah sistem internal production/project management, sehingga prioritas visual adalah **clarity dan information density yang terorganisir**.

---

# 8. COLOR SYSTEM

Pertahankan color system bawaan TailAdmin selama tidak ada kebutuhan untuk mengubahnya.

Jangan membuat banyak warna baru.

Siapkan semantic status colors yang nantinya dapat digunakan oleh sistem:

```text
success
warning
danger
info
neutral
```

Nantinya status seperti:

```text
DONE
ACTIVE
OVERDUE
EXPIRED
REVISION
APPROVED
PENDING
HOLD
CANCELLED
```

akan menggunakan semantic color system.

Pada fase ini cukup siapkan foundation-nya.

---

# 9. TYPOGRAPHY

Gunakan typography system dari TailAdmin yang sudah tersedia.

Jangan mengganti font secara global jika tidak diperlukan.

Pastikan:

- heading hierarchy jelas
- body text readable
- table text readable
- label form konsisten
- angka/statistik dashboard mudah dibaca

---

# 10. COMPONENT FOUNDATION

Audit component TailAdmin yang sudah tersedia dan gunakan kembali.

Siapkan atau rapikan reusable component untuk kebutuhan LOCO TRACK:

```text
PageHeader
PageContainer
SectionHeader
StatCard
StatusBadge
PriorityBadge
DataTable
EmptyState
LoadingState
ErrorState
SearchInput
FilterBar
DateFilter
Modal
ConfirmDialog
FormField
FileUpload
ProgressBar
Avatar
UserBadge
```

**Jangan membuat semuanya jika TailAdmin sudah memiliki component yang ekuivalen.**

Gunakan prinsip:

> Reuse existing component → extend component → create new component only when necessary.

---

# 11. API FOUNDATION

Belum perlu menghubungkan Laravel.

Tetapi siapkan abstraction untuk API agar nantinya frontend tidak melakukan `fetch()` secara acak di setiap component.

Contoh struktur:

```text
lib/
└── api/
    ├── client.ts
    ├── endpoints.ts
    └── types.ts
```

Siapkan environment variable:

```env
NEXT_PUBLIC_API_URL=
```

Contoh konsep:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Jangan hard-code URL backend di component.

---

# 12. TYPES FOUNDATION

Siapkan tempat untuk shared frontend types:

```text
types/
├── auth.ts
├── user.ts
├── project.ts
├── task.ts
├── client.ts
├── content.ts
├── workload.ts
├── output.ts
└── common.ts
```

Untuk Fase 1 tidak perlu membuat seluruh interface secara detail.

Cukup buat foundation yang dapat dikembangkan pada fase database dan API.

---

# 13. MOCK DATA

Jika TailAdmin membutuhkan data untuk menampilkan dashboard atau table, gunakan mock data sementara.

Pisahkan mock data dari component.

Contoh:

```text
lib/
└── mock/
    ├── dashboard.ts
    ├── projects.ts
    └── tasks.ts
```

Berikan komentar yang jelas bahwa mock data hanya temporary dan akan diganti dengan Laravel API pada fase berikutnya.

Jangan mencampurkan mock data langsung ke UI component.

---

# 14. DASHBOARD PLACEHOLDER

Buat dashboard awal yang menggunakan TailAdmin.

Belum perlu data real.

Gunakan struktur konseptual:

```text
LOCO TRACK Dashboard

[Total Project]
[Active Project]
[Done]
[Overdue]

[Project Progress]

[Upcoming Deadline]

[Team Workload]

[Pending Approval]

[Recent Activity]
```

Angka yang digunakan harus diberi label sebagai **mock/demo data**, bukan dianggap sebagai data perusahaan sebenarnya.

Requirement dashboard memang mencakup Total Project, Active Project, Done, Overdue, Overtime, Expiry Warning, Pending QC, Pending Approval, Revision, Project Progress, Workload Team, Deadline Terdekat, dan Task Bermasalah.

---

# 15. RESPONSIVE

Pastikan seluruh foundation:

- desktop
- laptop
- tablet
- mobile

dapat digunakan.

Sidebar harus responsive.

Table yang memiliki banyak kolom harus memiliki strategi responsive yang baik.

Jangan membuat horizontal overflow pada seluruh halaman hanya karena satu component.

---

# 16. CODE QUALITY

Terapkan:

- TypeScript strict jika template memungkinkan
- reusable components
- clean naming
- no unnecessary duplication
- no hard-coded API URL
- no hard-coded user role logic di banyak tempat
- no giant component
- no unnecessary inline CSS
- ESLint clean
- build harus berhasil

Jangan melakukan refactor besar terhadap TailAdmin tanpa alasan.

---

# 17. JANGAN IMPLEMENTASIKAN HAL-HAL BERIKUT PADA FASE 1

Jangan membuat:

- database
- migration
- Laravel
- login backend
- Sanctum
- RBAC backend
- CRUD project
- CRUD task
- approval logic
- workload calculation
- deadline calculation
- file versioning
- financial calculation
- reporting engine
- notification engine

Semua itu akan masuk fase berikutnya.

---

# 18. ACCEPTANCE CRITERIA

Fase 1 dianggap selesai jika:

### Project

- [ ] Next.js TailAdmin existing berhasil dijalankan
- [ ] Tidak ada error build
- [ ] Tidak ada error TypeScript yang tidak perlu
- [ ] ESLint tidak menghasilkan error kritis

### Layout

- [ ] Sidebar LOCO TRACK tersedia
- [ ] Header tersedia
- [ ] Responsive layout berjalan
- [ ] Navigation berjalan
- [ ] Active menu state berjalan

### Routing

- [ ] Semua route foundation tersedia
- [ ] Route menggunakan layout yang konsisten
- [ ] Tidak ada broken link

### Architecture

- [ ] Component reusable tersedia
- [ ] API abstraction tersedia
- [ ] Environment variable tersedia
- [ ] Types folder tersedia
- [ ] Mock data terpisah dari UI

### Visual

- [ ] Tetap menggunakan TailAdmin
- [ ] Tidak ada design system yang campur aduk
- [ ] Typography konsisten
- [ ] Spacing konsisten
- [ ] Responsive
- [ ] Tidak ada UI placeholder yang terlihat unfinished

---

# 19. OUTPUT YANG SAYA INGINKAN DARI ANDA

Setelah selesai:

1. Jelaskan struktur project yang kamu temukan sebelum perubahan.
2. Jelaskan perubahan yang kamu lakukan.
3. Tampilkan struktur folder final.
4. Daftar route yang dibuat.
5. Daftar component foundation yang dibuat/reused.
6. Jelaskan API abstraction yang disiapkan.
7. Jelaskan environment variable yang diperlukan.
8. Jalankan lint/build dan laporkan hasilnya.
9. Laporkan jika ada masalah yang belum diselesaikan.
10. Jangan melanjutkan ke Fase 2 sebelum saya memberikan instruksi berikutnya.

## PENTING

**Jangan mengarang requirement baru.**

Gunakan dokumen **LOCO TRACK — Analisis Kebutuhan Sistem** sebagai source of truth untuk kebutuhan sistem.

Pada fase ini fokus hanya pada **frontend foundation menggunakan template TailAdmin Next.js yang sudah tersedia**.

Jangan mengganti template.

Jangan membuat backend.

Jangan membuat database.

Jangan mengimplementasikan fitur bisnis.

Bangun foundation yang bersih dan scalable agar fase berikutnya dapat langsung dilanjutkan.
