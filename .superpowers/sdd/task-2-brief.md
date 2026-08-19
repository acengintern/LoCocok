### Task 2: Implement Enums

**Global Constraints:**
- Use PHP 8.1+ Enums for stable system states.
- Do not use UserStatus for clients; use ClientStatus (ACTIVE, INACTIVE, PROSPECT).

**Files:**
- Create: ackend/app/Enums/*.php

- [ ] **Step 1: Create Enum Files**
Create the following enums in ackend/app/Enums/:
- UserStatus (string: ACTIVE, INACTIVE, SUSPENDED)
- ClientStatus (string: ACTIVE, INACTIVE, PROSPECT)
- ProjectStatus (string: BRIEF_RECEIVED, CONTENT_PLANNING, SCRIPT_READY, DESIGN, EDITING, QC_INTERNAL, CLIENT_REVIEW, REVISION, APPROVED, PUBLISHED, DONE, HOLD, EXPIRED, OVERTIME, CANCELLED)
- TaskStatus (string: REQUEST, ON_PROGRESS, PREVIEW_INTERNAL, PREVIEW_CD, ACC_CD, PREVIEW_CLIENT, REVISION, READY_TO_UPLOAD, PUBLISH, DONE, HOLD, OVERDUE, EXPIRED, CANCELLED)
- Priority (string: LOW, MID, HIGH, URGENT)
- ContentPlanStatus (string: DRAFT, REVIEW, APPROVED, CANCELLED)
- ScriptStatus (string: IDEATION, DRAFT, REVIEW, APPROVED, READY_TO_SHOOT, CANCELLED)
- ApprovalStatus (string: APPROVED, REJECTED, CONDITIONAL)
- ApprovalType (string: INTERNAL_QC, CD_REVIEW, CLIENT_REVIEW)
- RevisionStatus (string: OPEN, IN_PROGRESS, RESOLVED, CANCELLED)
- FileVersionApprovalStatus (string: PENDING, APPROVED, REJECTED)
- PaymentStatus (string: PENDING, PARTIAL, PAID, CANCELLED)
- CostType (string: PRODUCTION, CREATIVE, DIRECT, OTHER)
- TimelineActivityStatus (string: PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)

**Example:**
`php
<?php

namespace App\Enums;

enum ClientStatus: string {
    case ACTIVE = 'ACTIVE';
    case INACTIVE = 'INACTIVE';
    case PROSPECT = 'PROSPECT';
}
`

**Instructions:**
- Create the Enums exactly as specified.
- Verify they exist in ackend/app/Enums/.
- Commit the changes when done.
- Write your report to .superpowers/sdd/task-2-report.md.
