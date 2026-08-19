# FINAL DATABASE ARCHITECTURE SPECIFICATION

## 1. Master Data Tables (Configurable Categories)
1. teams
2. project_types
3. output_types
4. task_types
5. file_types

## 2. Enums (Stable System States)
- UserStatus: ACTIVE, INACTIVE, SUSPENDED
- ClientStatus: ACTIVE, INACTIVE, PROSPECT
- ProjectStatus: BRIEF_RECEIVED, CONTENT_PLANNING, SCRIPT_READY, DESIGN, EDITING, QC_INTERNAL, CLIENT_REVIEW, REVISION, APPROVED, PUBLISHED, DONE, HOLD, EXPIRED, OVERTIME, CANCELLED
- TaskStatus: REQUEST, ON_PROGRESS, PREVIEW_INTERNAL, PREVIEW_CD, ACC_CD, PREVIEW_CLIENT, REVISION, READY_TO_UPLOAD, PUBLISH, DONE, HOLD, OVERDUE, EXPIRED, CANCELLED
- Priority: LOW, MID, HIGH, URGENT
- ContentPlanStatus: DRAFT, REVIEW, APPROVED, CANCELLED
- ScriptStatus: IDEATION, DRAFT, REVIEW, APPROVED, READY_TO_SHOOT, CANCELLED
- ApprovalStatus: APPROVED, REJECTED, CONDITIONAL
- ApprovalType: INTERNAL_QC, CD_REVIEW, CLIENT_REVIEW
- RevisionStatus: OPEN, IN_PROGRESS, RESOLVED, CANCELLED
- FileVersionApprovalStatus: PENDING, APPROVED, REJECTED
- PaymentStatus: PENDING, PARTIAL, PAID, CANCELLED
- CostType: PRODUCTION, CREATIVE, DIRECT, OTHER
- TimelineActivityStatus: PLANNED, IN_PROGRESS, COMPLETED, CANCELLED

## 3. Financial Transactional Entities
- project_financials: 1-to-1 with Project. Stores base financial configuration/budgets (Revenue, PPN, PPh, Working Budgets).
- project_payments: 1-to-many with Project. Tracks actual client payments towards the revenue.
- project_costs: 1-to-many with Project. Tracks actual incurred expenses against Working Budgets.

## 4. Entity List & Relationships

### 4.1. User & Access
- **users**
  - Purpose: Authentication and user data.
  - Fields: id, name, email, username, password, status (Enum UserStatus), join_date, deleted_at, timestamps.
  - Soft Delete: Yes.
- **teams** (Master Data)
  - Purpose: Configurable production teams.
  - Fields: id, name, description, deleted_at, timestamps.
  - Soft Delete: Yes.
- **team_members**
  - Purpose: Maps users to multiple teams.
  - Fields: id, team_id (FK), user_id (FK), timestamps.
  - Unique Constraint: team_id + user_id.
  - Soft Delete: No.
- (Spatie handles roles & permissions)

### 4.2. Client & Project Management
- **clients**
  - Purpose: Client profiles.
  - Fields: id, name, contact, email, phone, address, pic_ae_id (FK nullable), pic_sms_id (FK nullable), status (Enum ClientStatus), notes, deleted_at, timestamps.
  - Soft Delete: Yes.
- **contracts**
  - Purpose: MOU and legal agreements.
  - Fields: id, client_id (FK), project_id (FK nullable), mou_number, start_date, end_date, value, file_path, deleted_at, timestamps.
  - Soft Delete: Yes.
- **project_types** (Master Data)
  - Purpose: Project categorization.
  - Fields: id, name, code, description, deleted_at, timestamps.
  - Soft Delete: Yes.
- **projects**
  - Purpose: Core operational container.
  - Fields: id, project_code, client_id (FK), name, project_type_id (FK), ae_id (FK nullable), sms_id (FK nullable), cd_id (FK nullable), priority (Enum Priority), start_date, end_date, actual_end_date, status (Enum ProjectStatus), notes, deleted_at, timestamps.
  - Indexes: status, ae_id, client_id.
  - Soft Delete: Yes.

### 4.3. Financial Domain
- **project_financials**
  - Purpose: Stores financial budgets and setup per project.
  - Fields: id, project_id (FK), project_revenue, sales_commission, cost_of_sale, ppn, pph, nett_project_revenue, hpp, working_budget_production, working_budget_creative, deleted_at, timestamps.
  - Unique Constraint: project_id.
  - Soft Delete: Yes.
- **project_payments**
  - Purpose: Tracks client payments.
  - Fields: id, project_id (FK), amount, payment_date, status (Enum PaymentStatus), notes, timestamps.
  - Soft Delete: No.
- **project_costs**
  - Purpose: Tracks actual expenses (Realisation WB).
  - Fields: id, project_id (FK), description, amount, cost_type (Enum CostType), incurred_at, timestamps.
  - Soft Delete: No.

### 4.4. Output Management
- **output_types** (Master Data)
  - Fields: id, name, category, deleted_at, timestamps.
  - Soft Delete: Yes.
- **project_outputs**
  - Purpose: Target vs Actual tracking.
  - Fields: id, project_id (FK), output_type_id (FK), period, target_qty, actual_qty, timestamps.
  - Unique Constraint: project_id + output_type_id + period.
  - Soft Delete: No.

### 4.5. Content Planning
- **briefs**
  - Fields: id, project_id (FK), brief_text, objective, platform, content_requirement, reference, deadline, created_by (FK), deleted_at, timestamps.
  - Soft Delete: Yes.
- **content_plans**
  - Fields: id, project_id (FK), title, content_pillar, content_type, ideation, caption, platform, posting_date, reference, notes, status (Enum ContentPlanStatus), created_by (FK), deleted_at, timestamps.
  - Soft Delete: Yes.
- **scripts**
  - Fields: id, project_id (FK), content_plan_id (FK nullable), title, content_type, hook, concept, script_text, reference, talent, location, cta, notes, status (Enum ScriptStatus), created_by (FK), deleted_at, timestamps.
  - Soft Delete: Yes.

### 4.6. Task & Workload
- **task_types** (Master Data)
  - Fields: id, name, code, deleted_at, timestamps.
  - Soft Delete: Yes.
- **tasks**
  - Purpose: The parent production ticket.
  - Fields: id, project_id (FK), task_no, title, task_type_id (FK), output_type_id (FK nullable), description, due_date, priority (Enum Priority), status (Enum TaskStatus), quantity, created_by (FK), deleted_at, timestamps.
  - Unique Constraint: task_no.
  - Soft Delete: Yes.
- **task_assignments**
  - Purpose: Maps workers to tasks.
  - Fields: id, task_id (FK), user_id (FK), assigned_by (FK), assigned_at, deadline, priority (Enum Priority), extra_brief, personal_notes, timestamps.
  - Indexes: user_id, task_id.
  - Soft Delete: No.
- **additional_loads**
  - Purpose: Ad-hoc duties.
  - Fields: id, date, project_id (FK nullable), ae_id (FK nullable), assigned_user_id (FK), task_type_id (FK nullable), output_type_id (FK nullable), description, due_date, priority (Enum Priority), status (Enum TaskStatus), notes, timestamps.
  - Soft Delete: No.

### 4.7. Files & Versioning
- **file_types** (Master Data)
  - Fields: id, name, code, deleted_at, timestamps.
  - Soft Delete: Yes.
- **files**
  - Fields: id, project_id (FK), task_id (FK nullable), name, file_type_id (FK), path, uploaded_by (FK), current_version_id (FK nullable), deleted_at, timestamps.
  - FK Migration: current_version_id added after file_versions created.
  - Soft Delete: Yes.
- **file_versions**
  - Fields: id, file_id (FK), version_number, path, uploaded_by (FK), approval_status (Enum FileVersionApprovalStatus), revision_reason, notes, timestamps.
  - Unique Constraint: file_id + version_number.
  - Soft Delete: No.

### 4.8. Workflow & Tracking
- **approvals** (Polymorphic)
  - Purpose: Formal sign-offs.
  - Fields: id, approvable_type, approvable_id, approval_type (Enum ApprovalType), user_id (FK nullable), client_name, status (Enum ApprovalStatus), comments, reviewed_at, timestamps.
  - Soft Delete: No.
- **revisions** (Polymorphic)
  - Purpose: Revision requests.
  - Fields: id, revisionable_type, revisionable_id, requested_by (FK), description, status (Enum RevisionStatus), resolved_at, timestamps.
  - Soft Delete: No.
- **timeline_activities**
  - Purpose: Project milestones.
  - Fields: id, project_id (FK), user_id (FK nullable), activity_name, description, start_date, end_date, status (Enum TimelineActivityStatus), timestamps.
  - Soft Delete: No.

