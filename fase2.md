# FASE 2 — BACKEND & DATABASE ARCHITECTURE LOCO TRACK

Kita melanjutkan pengembangan **LOCO TRACK — Production & Project Management System**.

## KONDISI SAAT INI

Frontend sudah selesai pada **Fase 1** menggunakan:

- Next.js
- TypeScript
- Tailwind CSS
- TailAdmin
- App Router

Template TailAdmin existing sudah dipertahankan.

Frontend sudah memiliki foundation route:

```text
/dashboard

/projects
/production
/content
/timeline
/reports
/files
/activity-log
/administration
```

Sekarang masuk ke:

# FASE 2 — BACKEND & DATABASE ARCHITECTURE

Gunakan:

```text
Frontend
Next.js + TailAdmin
        │
        │ REST API
        ▼
Backend
Laravel
        │
        ▼
Database
MySQL
```

Pada fase ini **JANGAN mengimplementasikan UI frontend baru**.

Fokus utama adalah membangun:

1. Laravel backend foundation
2. Database architecture
3. ERD konseptual
4. Migration
5. Model
6. Eloquent relationship
7. Factory
8. Seeder
9. Enum / status architecture
10. API foundation
11. Struktur backend yang scalable

---

# 1. SOURCE OF TRUTH

Gunakan dokumen:

**LOCO TRACK — Analisis Kebutuhan Sistem**

sebagai source of truth.

Sistem mencakup proses:

```text
CLIENT
↓
BRIEF
↓
CONTENT PLAN
↓
SCRIPT / IDEATION
↓
ASSIGNMENT
↓
PRODUCTION
↓
QC INTERNAL
↓
REVISION / APPROVAL
↓
CLIENT REVIEW
↓
PUBLISH
↓
DONE
```

Requirement tersebut merupakan workflow utama sistem.

Jangan mengarang modul bisnis yang tidak dibutuhkan.

Jika ada kebutuhan database yang belum dijelaskan secara eksplisit di dokumen, gunakan desain teknis yang paling minimal dan scalable, lalu **tandai sebagai technical assumption** di laporan akhir.

Jangan diam-diam menganggap assumption sebagai requirement perusahaan.

---

# 2. BACKEND PROJECT

Jika Laravel belum tersedia, buat project Laravel backend terpisah dari Next.js.

Struktur konseptual:

```text
loco-track/
│
├── frontend/
│   └── Next.js + TailAdmin
│
└── backend/
    └── Laravel
```

Jika struktur repository existing berbeda, jangan memindahkan project secara paksa.

Audit terlebih dahulu.

Gunakan versi Laravel yang stabil dan kompatibel dengan environment yang tersedia.

---

# 3. DATABASE

Gunakan:

```text
MySQL
```

Konfigurasi database melalui `.env`.

Contoh:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=loco_track
DB_USERNAME=root
DB_PASSWORD=
```

Jangan hard-code credential.

Jika database belum tersedia, cukup siapkan konfigurasi dan migration.

---

# 4. DATABASE DESIGN PRINCIPLE

Database harus:

- relational
- normalized
- scalable
- memiliki foreign key
- memiliki index yang relevan
- menggunakan timestamp
- mendukung soft delete jika relevan
- menghindari duplikasi data
- tidak menyimpan data yang seharusnya berasal dari relationship
- tidak hard-code output type
- tidak hard-code role
- tidak hard-code permission
- tidak membuat satu tabel besar untuk seluruh sistem

Hindari desain seperti:

```text
projects
project_data_1
project_data_2
project_data_3
...
```

Gunakan relational architecture yang jelas.

---

# 5. CORE DOMAIN

Buat database berdasarkan domain utama LOCO TRACK:

```text
1. USER & ACCESS
2. PROJECT MANAGEMENT
3. CONTENT MANAGEMENT
4. TASK & WORKLOAD MANAGEMENT
5. PRODUCTION & APPROVAL
6. TIMELINE & DEADLINE
7. OUTPUT MONITORING
8. REPORTING & FINANCIAL MONITORING
```

Dokumen menyebut delapan domain tersebut sebagai domain utama sistem.

---

# 6. USER & ACCESS

Buat foundation untuk:

```text
users
roles
permissions
role_permissions
teams
team_members
```

User minimal memiliki:

```text
id
name
email
username
password
role
team
status
join_date
timestamps
```

Namun **jangan menyimpan role sebagai string bebas di users jika desain RBAC menggunakan relational role system**.

Gunakan relationship:

```text
users
  ↓
role
```

dan:

```text
role
  ↓
permissions
```

Permission mendukung:

```text
View
Create
Edit
Delete
Assign
Upload
Approve
Publish
Export
Manage
```

Requirement permission ini berasal dari dokumen LOCO TRACK.

---

# 7. ROLE

Siapkan role:

```text
System Administrator
Creative Director
Account Executive
Social Media Specialist
Graphic Designer
Video Editor / DAV
KOL
Production Assistant
```

Gunakan struktur yang mudah dikembangkan.

Jangan membuat logic:

```php
if ($user->role === 'admin')
```

tersebar di seluruh backend.

Gunakan centralized authorization melalui permission / policy.

---

# 8. TEAM

Buat:

```text
teams
team_members
```

Karena sistem harus mengetahui workload berdasarkan:

- role
- person
- team
- project

Contoh team dapat berupa:

```text
Design
Video
Social Media
Production
Account
Management
```

Tetapi jangan menganggap contoh tersebut sebagai master data perusahaan final.

Gunakan seeder hanya sebagai demo jika diperlukan.

---

# 9. CLIENT MANAGEMENT

Buat tabel:

```text
clients
```

Minimal mendukung:

```text
id
name
contact
email
phone
address
pic_ae
pic_sms
status
notes
timestamps
softDeletes
```

Requirement client mencakup:

- nama client
- contact
- PIC AE
- PIC SMS
- project
- contract
- revenue
- project history
- content history
- report
- timeline

Relasi tersebut harus berasal dari tabel terkait, bukan disimpan sebagai JSON besar di clients.

---

# 10. PROJECT MANAGEMENT

Buat tabel utama:

```text
projects
```

Project minimal membutuhkan:

```text
id
project_code
client_id
name
project_type_id
ae_id
sms_id
cd_id
priority
start_date
end_date
actual_end_date
status
progress
target_output
actual_output
contract_id
notes
timestamps
softDeletes
```

Requirement Project List mencakup:

```text
Project ID
Client
Project Name
Project Type
PIC AE
PIC SMS
Priority
Start Date
End Date
Realisasi End Date
Status
Progress
Target Output
Realisasi Output
Sisa Output
Sisa Hari
Contract
Timeline
Report
```

Jangan menyimpan:

```text
remaining_output
remaining_days
```

sebagai angka permanen jika nilai tersebut dapat dihitung.

Gunakan accessor/query/service untuk menghitung:

```text
Sisa Output = Target Output - Realisasi Output

Remaining Days = End Date - Current Date
```

---

# 11. PROJECT TYPE

Buat master data:

```text
project_types
```

Jangan hard-code:

```text
SMM
OTP
```

di dalam database projects.

Project type harus dapat ditambahkan melalui Master Data.

---

# 12. PROJECT STATUS

Siapkan architecture untuk project status.

Status berdasarkan dokumen:

```text
BRIEF_RECEIVED
CONTENT_PLANNING
SCRIPT_READY
DESIGN
EDITING
QC_INTERNAL
CLIENT_REVIEW
REVISION
APPROVED
PUBLISHED
DONE
```

Tambahan kondisi:

```text
HOLD
EXPIRED
OVERTIME
CANCELLED
```

Jangan mengimplementasikan workflow transition secara penuh pada fase ini.

Cukup siapkan enum / master status architecture yang dapat digunakan pada fase workflow.

---

# 13. BRIEF

Buat domain:

```text
briefs
```

Minimal mendukung:

```text
project_id
brief_text
objective
platform
content_requirement
reference
deadline
output
created_by
timestamps
```

File brief jangan disimpan langsung sebagai blob database.

Gunakan file management architecture pada tabel terpisah.

---

# 14. CONTENT PLAN

Buat:

```text
content_plans
```

Minimal:

```text
project_id
title
content_pillar
content_type
ideation
caption
platform
posting_date
reference
notes
status
created_by
timestamps
```

Satu project dapat memiliki banyak content plan.

Relationship:

```text
Project
hasMany
ContentPlan
```

---

# 15. SCRIPT / IDEATION

Buat:

```text
scripts
```

Field:

```text
project_id
content_plan_id
title
content_type
hook
concept
script
reference
talent
location
cta
notes
status
created_by
timestamps
```

Jika satu script hanya terkait content plan tertentu, gunakan relationship tersebut.

---

# 16. TASK MANAGEMENT

Buat tabel:

```text
tasks
```

Requirement task mencakup:

```text
Date
Project
AE/PIC
Priority
SMS
Task No
Type
Output
Description
Due Date
Notes
Status
Assigned To
Extra Brief
Quantity
Personal Notes
```

Jangan membuat satu kolom `assigned_to` jika ke depannya satu task dapat memiliki lebih dari satu assignment.

Gunakan architecture:

```text
tasks
task_assignments
```

---

# 17. TASK ASSIGNMENT

Buat:

```text
task_assignments
```

Minimal:

```text
task_id
user_id
assigned_by
assigned_at
deadline
priority
brief
status
timestamps
```

Relationship:

```text
Task
hasMany
TaskAssignment

User
hasMany
TaskAssignment
```

Hal ini akan menjadi foundation untuk workload management.

---

# 18. ADDITIONAL LOAD

Buat:

```text
additional_loads
```

Field berdasarkan requirement:

```text
date
project_id
priority
ae_id
type
output
description
due_date
notes
status
assigned_user_id
timestamps
```

Additional Load digunakan untuk pekerjaan tambahan di luar workload normal.

---

# 19. WORKLOAD

Jangan membuat tabel:

```text
designer_workload
editor_workload
bryan_workload
deven_workload
...
```

Dokumen secara eksplisit menyebut personal workload tidak perlu dibuat menjadi halaman terpisah untuk setiap orang.

Gunakan satu architecture workload berdasarkan:

```text
user
task
assignment
date
project
priority
status
```

Workload dapat dihitung dari task assignments.

---

# 20. FILE MANAGEMENT

Buat:

```text
files
file_versions
```

File harus dapat terkait dengan:

```text
project
task
```

Minimal files:

```text
id
project_id
task_id
name
type
path
uploaded_by
uploaded_at
current_version
timestamps
softDeletes
```

Version:

```text
id
file_id
version_number
path
uploaded_by
uploaded_at
approval_status
revision_reason
notes
timestamps
```

Requirement file mencakup:

```text
Brief
Content Plan
Script
Reference
Design
Video
Preview
Revision
Contract
Timeline
Report
BAST
Other Document
```

Jangan membuat tabel terpisah untuk setiap jenis file.

Gunakan:

```text
file_type
```

atau master data.

---

# 21. VERSIONING

Versioning harus mempertahankan history.

Contoh:

```text
v1
v2
v3
Final
```

Jangan overwrite file version sebelumnya.

Business rule:

> Revision tidak boleh menghapus versi sebelumnya.

---

# 22. APPROVAL

Siapkan:

```text
approvals
```

Minimal:

```text
task_id
project_id
approval_type
submitted_by
reviewed_by
status
feedback
submitted_at
reviewed_at
timestamps
```

Approval type minimal:

```text
CD
CLIENT
```

Status:

```text
PENDING
APPROVED
REVISION
REJECTED
```

Jangan membuat approval logic penuh dahulu.

Fase ini hanya menyiapkan database architecture.

---

# 23. REVISION

Buat:

```text
revisions
```

Minimal:

```text
task_id
project_id
file_id
requested_by
assigned_to
reason
status
created_at
resolved_at
timestamps
```

History revisi harus tetap tersimpan.

---

# 24. TIMELINE

Buat architecture:

```text
timeline_activities
```

Minimal:

```text
project_id
task_id
user_id
data_type
document
activity
description
start_date
end_date
status
timestamps
```

Data type dapat mencakup:

```text
Master Data
Contract
Report
BAST
Invoice
```

Activity dapat mencakup:

```text
Preview
Feedback
Revision
Approval
Production
Publish
```

---

# 25. CONTRACT

Buat:

```text
contracts
```

Minimal:

```text
client_id
project_id
contract_number
type
start_date
end_date
value
document
status
timestamps
```

Jenis dokumen dapat mendukung:

```text
Contract
MOU
```

Jangan memasukkan financial reporting kompleks ke contracts pada fase ini.

---

# 26. OUTPUT MANAGEMENT

Buat:

```text
output_types
project_outputs
```

Output type harus dynamic/master data.

Contoh dari requirement:

```text
Single Post
Carousel
Story
Reels
Video
Design
Production
```

Tetapi jangan membatasi hanya pada daftar tersebut.

`project_outputs` minimal:

```text
project_id
output_type_id
period
target
actual
start_date
end_date
timestamps
```

Progress:

```text
progress = actual / target * 100
```

Sisa:

```text
remaining = target - actual
```

Jangan menyimpan calculated value secara permanen jika tidak diperlukan.

---

# 27. ACTIVITY LOG

Buat:

```text
activity_logs
```

Semua perubahan penting harus dapat dicatat.

Minimal:

```text
user_id
action
entity_type
entity_id
description
old_values
new_values
ip_address
user_agent
created_at
```

Contoh:

```text
SMS Amel assigned Designer Deven
Deven uploaded Design v1
CD reviewed Design
CD requested revision
Deven uploaded Design v2
CD approved
```

Requirement menyatakan semua perubahan harus dicatat dalam Activity Log.

Gunakan JSON untuk `old_values` dan `new_values` jika database support.

---

# 28. NOTIFICATION

Siapkan database foundation:

```text
notifications
```

Belum perlu notification engine.

Notification nantinya mendukung:

```text
Assignment
Deadline
Overdue
QC
Revision
Client Review
Approval
Publish
```

---

# 29. FINANCIAL FOUNDATION

Buat struktur database yang terpisah dan mudah di-restrict.

Minimal domain:

```text
project_financials
payments
budgets
```

Tetapi jangan membuat business logic finansial kompleks pada fase ini.

Data requirement mencakup:

```text
Project Revenue
Sales Commission
Cost of Sale
PPN
PPh
Nett Project Revenue
Revenue / Month
Payment Status
HPP
Working Budget Production
Realisation WB Production
Working Budget Creative
Realisation WB Creative
Direct Project Cost
```

Gunakan naming yang konsisten.

**PENTING:**

Financial module harus diperlakukan sebagai restricted module.

Jangan memberikan akses finansial kepada seluruh role.

---

# 30. REPORTING

Jangan membuat tabel:

```text
daily_reports
weekly_reports
monthly_reports
designer_reports
editor_reports
```

hanya untuk menyimpan hasil report.

Sebisa mungkin report dibangun dari query terhadap transactional tables.

Contoh:

```text
Daily Workload
→ task_assignments + tasks

Team Performance
→ task_assignments + tasks

Project Output
→ project_outputs

Deadline
→ projects + tasks

Overdue
→ projects + tasks

Client Report
→ clients + projects

Project Timeline
→ timeline_activities
```

Reporting database architecture harus menghindari duplikasi data.

---

# 31. INDEXING

Tambahkan index pada kolom yang sering digunakan untuk:

- filtering
- sorting
- relationship
- dashboard
- workload
- deadline
- status

Contoh:

```text
projects:
client_id
project_type_id
ae_id
sms_id
cd_id
status
priority
start_date
end_date

tasks:
project_id
status
priority
due_date

task_assignments:
task_id
user_id
deadline
status

activity_logs:
user_id
entity_type
entity_id
created_at
```

Jangan membuat index berlebihan tanpa alasan.

---

# 32. FOREIGN KEY

Gunakan foreign key yang benar.

Contoh:

```text
projects.client_id
→ clients.id

projects.ae_id
→ users.id

projects.sms_id
→ users.id

tasks.project_id
→ projects.id

task_assignments.task_id
→ tasks.id

task_assignments.user_id
→ users.id
```

Tentukan `cascade`, `restrict`, atau `nullOnDelete` secara hati-hati.

Jangan menggunakan cascade delete pada relationship yang seharusnya mempertahankan history.

Contohnya Activity Log tidak boleh hilang hanya karena entity utama dihapus.

---

# 33. SOFT DELETE

Gunakan soft delete untuk entity yang memiliki history penting, jika sesuai.

Contoh:

```text
users
clients
projects
tasks
files
```

Tetapi jangan otomatis menambahkan soft delete ke semua tabel.

Jelaskan alasan pemilihannya.

---

# 34. ENUM VS MASTER DATA

Gunakan prinsip:

Gunakan **master table** jika data perlu dapat ditambah/diubah administrator.

Contoh:

```text
project_types
output_types
```

Gunakan enum/constants jika nilai benar-benar merupakan state sistem yang stabil.

Contoh:

```text
approval status
```

Jika masih memungkinkan berubah di masa depan, gunakan master table.

Jelaskan keputusan tersebut.

---

# 35. ELOQUENT RELATIONSHIP

Setiap model harus memiliki relationship yang jelas.

Contoh:

```php
Project
    belongsTo Client
    belongsTo AE
    belongsTo SMS
    belongsTo CD
    belongsTo ProjectType
    hasMany Tasks
    hasMany ContentPlans
    hasMany Scripts
    hasMany Files
    hasMany Approvals
    hasMany TimelineActivities
    hasMany ProjectOutputs
```

Dan relationship lain sesuai kebutuhan.

Jangan membuat relationship hanya agar terlihat lengkap.

Pastikan setiap relationship mempunyai alasan bisnis.

---

# 36. FACTORY & SEEDER

Buat factory dan seeder untuk development.

Minimal seed:

```text
Roles
Permissions
Users
Teams
Clients
Project Types
Output Types
```

Buat beberapa sample project/task hanya jika diperlukan untuk testing relationship.

Gunakan data dummy yang jelas.

Jangan memasukkan data perusahaan asli.

Contoh:

```text
Admin
Creative Director
Account Executive
Social Media Specialist
Graphic Designer
Video Editor
KOL
Production Assistant
```

Gunakan email development seperti:

```text
admin@example.test
```

Jangan gunakan email personal.

---

# 37. API FOUNDATION

Belum perlu membuat seluruh CRUD endpoint.

Siapkan struktur:

```text
routes/
├── api.php

app/
├── Http/
│   ├── Controllers/
│   ├── Requests/
│   └── Resources/
│
├── Models/
├── Services/
├── Policies/
└── Enums/
```

API harus dipersiapkan untuk dikonsumsi Next.js.

Gunakan response JSON yang konsisten.

Contoh:

```json
{
    "data": {},
    "message": "Success"
}
```

Untuk error:

```json
{
    "message": "Validation failed",
    "errors": {}
}
```

Belum perlu membuat semua endpoint bisnis.

---

# 38. ARCHITECTURE PRINCIPLE

Jangan menaruh seluruh business logic di Controller.

Gunakan:

```text
Controller
    ↓
Service
    ↓
Model / Query
```

Untuk authorization:

```text
Policy / Permission
```

Untuk validation:

```text
Form Request
```

Untuk API response:

```text
API Resource
```

---

# 39. ERD

Buat dokumentasi ERD untuk database LOCO TRACK.

Minimal tunjukkan:

```text
Users
Roles
Permissions
Teams
Clients
Projects
Project Types
Contracts
Briefs
Content Plans
Scripts
Tasks
Task Assignments
Additional Loads
Files
File Versions
Approvals
Revisions
Timeline Activities
Output Types
Project Outputs
Activity Logs
Notifications
Financial Tables
```

ERD harus menunjukkan:

- primary key
- foreign key
- cardinality
- relationship

Jika menggunakan tool/library untuk membuat diagram, gunakan yang paling sederhana dan maintainable.

---

# 40. MIGRATION ORDER

Pastikan migration dapat dijalankan dari database kosong.

Urutan dependency harus benar.

Secara konseptual:

```text
1. roles / permissions
2. teams
3. users
4. clients
5. project_types
6. contracts
7. projects
8. briefs
9. content_plans
10. scripts
11. tasks
12. task_assignments
13. additional_loads
14. output_types
15. project_outputs
16. files
17. file_versions
18. approvals
19. revisions
20. timeline_activities
21. activity_logs
22. notifications
23. financial tables
```

Sesuaikan urutan aktual berdasarkan foreign key yang dibuat.

---

# 41. TEST DATABASE

Setelah migration:

```bash
php artisan migrate:fresh --seed
```

harus berhasil.

Test:

```bash
php artisan migrate:fresh --seed
php artisan db:show
php artisan route:list
```

Jika command tersedia di versi Laravel yang digunakan.

Pastikan:

- migration berhasil
- seeder berhasil
- relationship tidak error
- foreign key valid
- database dapat dibuat dari kondisi kosong

---

# 42. JANGAN MELAKUKAN INI

Pada Fase 2 jangan:

- membuat UI baru di Next.js
- mengubah design TailAdmin
- membuat dashboard final
- membuat CRUD lengkap
- membuat workflow engine
- membuat approval engine
- membuat notification engine
- membuat report UI
- membuat financial UI
- menghubungkan frontend dengan API secara penuh

Semua itu fase berikutnya.

---

# 43. ACCEPTANCE CRITERIA

Fase 2 dianggap selesai jika:

### Backend

- [ ] Laravel project siap
- [ ] MySQL connection berhasil
- [ ] `.env` tidak menyimpan credential hard-code di source control
- [ ] API foundation tersedia
- [ ] struktur Controller / Service / Request / Resource tersedia

### Database

- [ ] seluruh core entity sudah dirancang
- [ ] migration tersedia
- [ ] foreign key benar
- [ ] index relevan tersedia
- [ ] relationship Eloquent tersedia
- [ ] soft delete digunakan secara tepat
- [ ] tidak ada tabel duplikatif yang tidak perlu
- [ ] output type tidak hard-code
- [ ] role/permission tidak hard-code

### Development Data

- [ ] Factory tersedia
- [ ] Seeder tersedia
- [ ] Role tersedia
- [ ] Permission tersedia
- [ ] User dummy tersedia
- [ ] Master data dummy tersedia

### Quality

- [ ] `php artisan migrate:fresh --seed` berhasil
- [ ] Laravel tidak memiliki error migration
- [ ] tidak ada foreign key error
- [ ] model relationship dapat digunakan
- [ ] code mengikuti struktur Laravel yang maintainable

### Documentation

- [ ] ERD tersedia
- [ ] daftar tabel tersedia
- [ ] relationship tersedia
- [ ] technical assumptions dicatat
- [ ] keputusan ENUM vs Master Data dijelaskan

---

# 44. OUTPUT LAPORAN AGENT

Setelah selesai, jangan langsung lanjut ke Fase 3.

Berikan laporan:

## 1. Backend Structure

Tampilkan struktur Laravel final.

## 2. Database Tables

Buat tabel:

```text
Table | Purpose | Key Relationships
```

## 3. ERD

Tampilkan atau berikan lokasi ERD.

## 4. Models

Daftar seluruh Eloquent model.

## 5. Relationships

Jelaskan relationship utama.

## 6. Migrations

Daftar migration yang dibuat.

## 7. Seeders

Daftar data development yang dibuat.

## 8. API Foundation

Jelaskan struktur API yang sudah disiapkan.

## 9. Technical Assumptions

Pisahkan dengan jelas mana yang:

```text
Requirement dari dokumen
vs
Technical assumption
```

## 10. Validation

Laporkan hasil:

```bash
php artisan migrate:fresh --seed
```

dan command testing lain yang digunakan.

## 11. Issues

Laporkan semua masalah yang masih ada.

---

# ATURAN PALING PENTING

**Jangan melanjutkan ke Fase 3 setelah Fase 2 selesai.**

Berhenti setelah:

```text
Database
+
Models
+
Relationships
+
Migration
+
Seeder
+
ERD
+
Backend Foundation
```

sudah stabil.

Saya akan melakukan review terlebih dahulu sebelum memberikan instruksi Fase 3.

Gunakan dokumen **LOCO TRACK — Analisis Kebutuhan Sistem** sebagai sumber utama dan pertahankan terminologi yang digunakan di dalam dokumen.
