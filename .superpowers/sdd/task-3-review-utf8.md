5739ca6 feat: implement database migrations based on architecture spec

 .../0001_01_01_000000_create_users_table.php       |   4 +
 ...2026_08_19_200001_create_master_data_tables.php |  61 ++++++++++++
 ...0002_create_clients_and_team_members_tables.php |  41 ++++++++
 .../2026_08_19_200003_create_projects_tables.php   | 107 +++++++++++++++++++++
 ...08_19_200004_create_content_planning_tables.php |  70 ++++++++++++++
 .../2026_08_19_200005_create_tasks_tables.php      |  67 +++++++++++++
 .../2026_08_19_200006_create_files_tables.php      |  51 ++++++++++
 ...2026_08_19_200007_create_polymorphic_tables.php |  58 +++++++++++
 8 files changed, 459 insertions(+)

diff --git a/backend/database/migrations/0001_01_01_000000_create_users_table.php b/backend/database/migrations/0001_01_01_000000_create_users_table.php
index 05fb5d9..5e32831 100644
--- a/backend/database/migrations/0001_01_01_000000_create_users_table.php
+++ b/backend/database/migrations/0001_01_01_000000_create_users_table.php
@@ -15,10 +15,14 @@ public function up(): void
             $table->id();
             $table->string('name');
             $table->string('email')->unique();
+            $table->string('username')->unique();
             $table->timestamp('email_verified_at')->nullable();
             $table->string('password');
+            $table->enum('status', ['ACTIVE', 'INACTIVE', 'SUSPENDED'])->default('ACTIVE');
+            $table->date('join_date')->nullable();
             $table->rememberToken();
             $table->timestamps();
+            $table->softDeletes();
         });
 
         Schema::create('password_reset_tokens', function (Blueprint $table) {
diff --git a/backend/database/migrations/2026_08_19_200001_create_master_data_tables.php b/backend/database/migrations/2026_08_19_200001_create_master_data_tables.php
new file mode 100644
index 0000000..9426e54
--- /dev/null
+++ b/backend/database/migrations/2026_08_19_200001_create_master_data_tables.php
@@ -0,0 +1,61 @@
+<?php
+
+use Illuminate\Database\Migrations\Migration;
+use Illuminate\Database\Schema\Blueprint;
+use Illuminate\Support\Facades\Schema;
+
+return new class extends Migration
+{
+    public function up(): void
+    {
+        Schema::create('teams', function (Blueprint $table) {
+            $table->id();
+            $table->string('name');
+            $table->text('description')->nullable();
+            $table->timestamps();
+            $table->softDeletes();
+        });
+
+        Schema::create('project_types', function (Blueprint $table) {
+            $table->id();
+            $table->string('name');
+            $table->string('code')->nullable();
+            $table->text('description')->nullable();
+            $table->timestamps();
+            $table->softDeletes();
+        });
+
+        Schema::create('output_types', function (Blueprint $table) {
+            $table->id();
+            $table->string('name');
+            $table->string('category')->nullable();
+            $table->timestamps();
+            $table->softDeletes();
+        });
+
+        Schema::create('task_types', function (Blueprint $table) {
+            $table->id();
+            $table->string('name');
+            $table->string('code')->nullable();
+            $table->timestamps();
+            $table->softDeletes();
+        });
+
+        Schema::create('file_types', function (Blueprint $table) {
+            $table->id();
+            $table->string('name');
+            $table->string('code')->nullable();
+            $table->timestamps();
+            $table->softDeletes();
+        });
+    }
+
+    public function down(): void
+    {
+        Schema::dropIfExists('file_types');
+        Schema::dropIfExists('task_types');
+        Schema::dropIfExists('output_types');
+        Schema::dropIfExists('project_types');
+        Schema::dropIfExists('teams');
+    }
+};
diff --git a/backend/database/migrations/2026_08_19_200002_create_clients_and_team_members_tables.php b/backend/database/migrations/2026_08_19_200002_create_clients_and_team_members_tables.php
new file mode 100644
index 0000000..eb57956
--- /dev/null
+++ b/backend/database/migrations/2026_08_19_200002_create_clients_and_team_members_tables.php
@@ -0,0 +1,41 @@
+<?php
+
+use Illuminate\Database\Migrations\Migration;
+use Illuminate\Database\Schema\Blueprint;
+use Illuminate\Support\Facades\Schema;
+
+return new class extends Migration
+{
+    public function up(): void
+    {
+        Schema::create('clients', function (Blueprint $table) {
+            $table->id();
+            $table->string('name');
+            $table->string('contact')->nullable();
+            $table->string('email')->nullable();
+            $table->string('phone')->nullable();
+            $table->text('address')->nullable();
+            $table->foreignId('pic_ae_id')->nullable()->constrained('users')->nullOnDelete();
+            $table->foreignId('pic_sms_id')->nullable()->constrained('users')->nullOnDelete();
+            $table->enum('status', ['ACTIVE', 'INACTIVE', 'PROSPECT'])->default('ACTIVE');
+            $table->text('notes')->nullable();
+            $table->timestamps();
+            $table->softDeletes();
+        });
+
+        Schema::create('team_members', function (Blueprint $table) {
+            $table->id();
+            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
+            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
+            $table->timestamps();
+
+            $table->unique(['team_id', 'user_id']);
+        });
+    }
+
+    public function down(): void
+    {
+        Schema::dropIfExists('team_members');
+        Schema::dropIfExists('clients');
+    }
+};
diff --git a/backend/database/migrations/2026_08_19_200003_create_projects_tables.php b/backend/database/migrations/2026_08_19_200003_create_projects_tables.php
new file mode 100644
index 0000000..959ff40
--- /dev/null
+++ b/backend/database/migrations/2026_08_19_200003_create_projects_tables.php
@@ -0,0 +1,107 @@
+<?php
+
+use Illuminate\Database\Migrations\Migration;
+use Illuminate\Database\Schema\Blueprint;
+use Illuminate\Support\Facades\Schema;
+
+return new class extends Migration
+{
+    public function up(): void
+    {
+        Schema::create('projects', function (Blueprint $table) {
+            $table->id();
+            $table->string('project_code')->nullable();
+            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
+            $table->string('name');
+            $table->foreignId('project_type_id')->constrained()->cascadeOnDelete();
+            $table->foreignId('ae_id')->nullable()->constrained('users')->nullOnDelete();
+            $table->foreignId('sms_id')->nullable()->constrained('users')->nullOnDelete();
+            $table->foreignId('cd_id')->nullable()->constrained('users')->nullOnDelete();
+            $table->enum('priority', ['LOW', 'MID', 'HIGH', 'URGENT'])->default('MID');
+            $table->date('start_date')->nullable();
+            $table->date('end_date')->nullable();
+            $table->date('actual_end_date')->nullable();
+            $table->enum('status', ['BRIEF_RECEIVED', 'CONTENT_PLANNING', 'SCRIPT_READY', 'DESIGN', 'EDITING', 'QC_INTERNAL', 'CLIENT_REVIEW', 'REVISION', 'APPROVED', 'PUBLISHED', 'DONE', 'HOLD', 'EXPIRED', 'OVERTIME', 'CANCELLED'])->default('BRIEF_RECEIVED');
+            $table->text('notes')->nullable();
+            $table->timestamps();
+            $table->softDeletes();
+
+            $table->index('status');
+            $table->index('ae_id');
+            $table->index('client_id');
+        });
+
+        Schema::create('contracts', function (Blueprint $table) {
+            $table->id();
+            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
+            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
+            $table->string('mou_number')->nullable();
+            $table->date('start_date')->nullable();
+            $table->date('end_date')->nullable();
+            $table->decimal('value', 15, 2)->nullable();
+            $table->string('file_path')->nullable();
+            $table->timestamps();
+            $table->softDeletes();
+        });
+
+        Schema::create('project_financials', function (Blueprint $table) {
+            $table->id();
+            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
+            $table->decimal('project_revenue', 15, 2)->default(0);
+            $table->decimal('sales_commission', 15, 2)->default(0);
+            $table->decimal('cost_of_sale', 15, 2)->default(0);
+            $table->decimal('ppn', 15, 2)->default(0);
+            $table->decimal('pph', 15, 2)->default(0);
+            $table->decimal('nett_project_revenue', 15, 2)->default(0);
+            $table->decimal('hpp', 15, 2)->default(0);
+            $table->decimal('working_budget_production', 15, 2)->default(0);
+            $table->decimal('working_budget_creative', 15, 2)->default(0);
+            $table->timestamps();
+            $table->softDeletes();
+
+            $table->unique('project_id');
+        });
+
+        Schema::create('project_payments', function (Blueprint $table) {
+            $table->id();
+            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
+            $table->decimal('amount', 15, 2);
+            $table->date('payment_date')->nullable();
+            $table->enum('status', ['PENDING', 'PARTIAL', 'PAID', 'CANCELLED'])->default('PENDING');
+            $table->text('notes')->nullable();
+            $table->timestamps();
+        });
+
+        Schema::create('project_costs', function (Blueprint $table) {
+            $table->id();
+            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
+            $table->string('description');
+            $table->decimal('amount', 15, 2);
+            $table->enum('cost_type', ['PRODUCTION', 'CREATIVE', 'DIRECT', 'OTHER'])->default('OTHER');
+            $table->date('incurred_at')->nullable();
+            $table->timestamps();
+        });
+
+        Schema::create('project_outputs', function (Blueprint $table) {
+            $table->id();
+            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
+            $table->foreignId('output_type_id')->constrained()->cascadeOnDelete();
+            $table->string('period')->nullable();
+            $table->integer('target_qty')->default(0);
+            $table->integer('actual_qty')->default(0);
+            $table->timestamps();
+
+            $table->unique(['project_id', 'output_type_id', 'period']);
+        });
+    }
+
+    public function down(): void
+    {
+        Schema::dropIfExists('project_outputs');
+        Schema::dropIfExists('project_costs');
+        Schema::dropIfExists('project_payments');
+        Schema::dropIfExists('project_financials');
+        Schema::dropIfExists('contracts');
+        Schema::dropIfExists('projects');
+    }
+};
diff --git a/backend/database/migrations/2026_08_19_200004_create_content_planning_tables.php b/backend/database/migrations/2026_08_19_200004_create_content_planning_tables.php
new file mode 100644
index 0000000..aaf43b9
--- /dev/null
+++ b/backend/database/migrations/2026_08_19_200004_create_content_planning_tables.php
@@ -0,0 +1,70 @@
+<?php
+
+use Illuminate\Database\Migrations\Migration;
+use Illuminate\Database\Schema\Blueprint;
+use Illuminate\Support\Facades\Schema;
+
+return new class extends Migration
+{
+    public function up(): void
+    {
+        Schema::create('briefs', function (Blueprint $table) {
+            $table->id();
+            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
+            $table->text('brief_text')->nullable();
+            $table->text('objective')->nullable();
+            $table->string('platform')->nullable();
+            $table->text('content_requirement')->nullable();
+            $table->text('reference')->nullable();
+            $table->date('deadline')->nullable();
+            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
+            $table->timestamps();
+            $table->softDeletes();
+        });
+
+        Schema::create('content_plans', function (Blueprint $table) {
+            $table->id();
+            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
+            $table->string('title');
+            $table->string('content_pillar')->nullable();
+            $table->string('content_type')->nullable();
+            $table->text('ideation')->nullable();
+            $table->text('caption')->nullable();
+            $table->string('platform')->nullable();
+            $table->date('posting_date')->nullable();
+            $table->text('reference')->nullable();
+            $table->text('notes')->nullable();
+            $table->enum('status', ['DRAFT', 'REVIEW', 'APPROVED', 'CANCELLED'])->default('DRAFT');
+            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
+            $table->timestamps();
+            $table->softDeletes();
+        });
+
+        Schema::create('scripts', function (Blueprint $table) {
+            $table->id();
+            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
+            $table->foreignId('content_plan_id')->nullable()->constrained()->nullOnDelete();
+            $table->string('title');
+            $table->string('content_type')->nullable();
+            $table->text('hook')->nullable();
+            $table->text('concept')->nullable();
+            $table->text('script_text')->nullable();
+            $table->text('reference')->nullable();
+            $table->string('talent')->nullable();
+            $table->string('location')->nullable();
+            $table->string('cta')->nullable();
+            $table->text('notes')->nullable();
+            $table->enum('status', ['IDEATION', 'DRAFT', 'REVIEW', 'APPROVED', 'READY_TO_SHOOT', 'CANCELLED'])->default('IDEATION');
+            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
+            $table->timestamps();
+            $table->softDeletes();
+        });
+    }
+
+    public function down(): void
+    {
+        Schema::dropIfExists('scripts');
+        Schema::dropIfExists('content_plans');
+        Schema::dropIfExists('briefs');
+    }
+};
diff --git a/backend/database/migrations/2026_08_19_200005_create_tasks_tables.php b/backend/database/migrations/2026_08_19_200005_create_tasks_tables.php
new file mode 100644
index 0000000..93b95de
--- /dev/null
+++ b/backend/database/migrations/2026_08_19_200005_create_tasks_tables.php
@@ -0,0 +1,67 @@
+<?php
+
+use Illuminate\Database\Migrations\Migration;
+use Illuminate\Database\Schema\Blueprint;
+use Illuminate\Support\Facades\Schema;
+
+return new class extends Migration
+{
+    public function up(): void
+    {
+        Schema::create('tasks', function (Blueprint $table) {
+            $table->id();
+            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
+            $table->string('task_no')->unique();
+            $table->string('title');
+            $table->foreignId('task_type_id')->constrained()->cascadeOnDelete();
+            $table->foreignId('output_type_id')->nullable()->constrained()->nullOnDelete();
+            $table->text('description')->nullable();
+            $table->date('due_date')->nullable();
+            $table->enum('priority', ['LOW', 'MID', 'HIGH', 'URGENT'])->default('MID');
+            $table->enum('status', ['REQUEST', 'ON_PROGRESS', 'PREVIEW_INTERNAL', 'PREVIEW_CD', 'ACC_CD', 'PREVIEW_CLIENT', 'REVISION', 'READY_TO_UPLOAD', 'PUBLISH', 'DONE', 'HOLD', 'OVERDUE', 'EXPIRED', 'CANCELLED'])->default('REQUEST');
+            $table->integer('quantity')->default(1);
+            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
+            $table->timestamps();
+            $table->softDeletes();
+        });
+
+        Schema::create('task_assignments', function (Blueprint $table) {
+            $table->id();
+            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
+            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
+            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
+            $table->timestamp('assigned_at')->nullable();
+            $table->date('deadline')->nullable();
+            $table->enum('priority', ['LOW', 'MID', 'HIGH', 'URGENT'])->default('MID');
+            $table->text('extra_brief')->nullable();
+            $table->text('personal_notes')->nullable();
+            $table->timestamps();
+
+            $table->index('user_id');
+            $table->index('task_id');
+        });
+
+        Schema::create('additional_loads', function (Blueprint $table) {
+            $table->id();
+            $table->date('date')->nullable();
+            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
+            $table->foreignId('ae_id')->nullable()->constrained('users')->nullOnDelete();
+            $table->foreignId('assigned_user_id')->constrained('users')->cascadeOnDelete();
+            $table->foreignId('task_type_id')->nullable()->constrained()->nullOnDelete();
+            $table->foreignId('output_type_id')->nullable()->constrained()->nullOnDelete();
+            $table->text('description')->nullable();
+            $table->date('due_date')->nullable();
+            $table->enum('priority', ['LOW', 'MID', 'HIGH', 'URGENT'])->default('MID');
+            $table->enum('status', ['REQUEST', 'ON_PROGRESS', 'PREVIEW_INTERNAL', 'PREVIEW_CD', 'ACC_CD', 'PREVIEW_CLIENT', 'REVISION', 'READY_TO_UPLOAD', 'PUBLISH', 'DONE', 'HOLD', 'OVERDUE', 'EXPIRED', 'CANCELLED'])->default('REQUEST');
+            $table->text('notes')->nullable();
+            $table->timestamps();
+        });
+    }
+
+    public function down(): void
+    {
+        Schema::dropIfExists('additional_loads');
+        Schema::dropIfExists('task_assignments');
+        Schema::dropIfExists('tasks');
+    }
+};
diff --git a/backend/database/migrations/2026_08_19_200006_create_files_tables.php b/backend/database/migrations/2026_08_19_200006_create_files_tables.php
new file mode 100644
index 0000000..aa8a8ec
--- /dev/null
+++ b/backend/database/migrations/2026_08_19_200006_create_files_tables.php
@@ -0,0 +1,51 @@
+<?php
+
+use Illuminate\Database\Migrations\Migration;
+use Illuminate\Database\Schema\Blueprint;
+use Illuminate\Support\Facades\Schema;
+
+return new class extends Migration
+{
+    public function up(): void
+    {
+        Schema::create('files', function (Blueprint $table) {
+            $table->id();
+            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
+            $table->foreignId('task_id')->nullable()->constrained()->nullOnDelete();
+            $table->string('name');
+            $table->foreignId('file_type_id')->constrained()->cascadeOnDelete();
+            $table->string('path')->nullable();
+            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
+            $table->unsignedBigInteger('current_version_id')->nullable();
+            $table->timestamps();
+            $table->softDeletes();
+        });
+
+        Schema::create('file_versions', function (Blueprint $table) {
+            $table->id();
+            $table->foreignId('file_id')->constrained()->cascadeOnDelete();
+            $table->integer('version_number');
+            $table->string('path')->nullable();
+            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
+            $table->enum('approval_status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
+            $table->text('revision_reason')->nullable();
+            $table->text('notes')->nullable();
+            $table->timestamps();
+
+            $table->unique(['file_id', 'version_number']);
+        });
+
+        Schema::table('files', function (Blueprint $table) {
+            $table->foreign('current_version_id')->references('id')->on('file_versions')->nullOnDelete();
+        });
+    }
+
+    public function down(): void
+    {
+        Schema::table('files', function (Blueprint $table) {
+            $table->dropForeign(['current_version_id']);
+        });
+        Schema::dropIfExists('file_versions');
+        Schema::dropIfExists('files');
+    }
+};
diff --git a/backend/database/migrations/2026_08_19_200007_create_polymorphic_tables.php b/backend/database/migrations/2026_08_19_200007_create_polymorphic_tables.php
new file mode 100644
index 0000000..30cfa7c
--- /dev/null
+++ b/backend/database/migrations/2026_08_19_200007_create_polymorphic_tables.php
@@ -0,0 +1,58 @@
+<?php
+
+use Illuminate\Database\Migrations\Migration;
+use Illuminate\Database\Schema\Blueprint;
+use Illuminate\Support\Facades\Schema;
+
+return new class extends Migration
+{
+    public function up(): void
+    {
+        Schema::create('approvals', function (Blueprint $table) {
+            $table->id();
+            $table->string('approvable_type');
+            $table->unsignedBigInteger('approvable_id');
+            $table->enum('approval_type', ['INTERNAL_QC', 'CD_REVIEW', 'CLIENT_REVIEW']);
+            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
+            $table->string('client_name')->nullable();
+            $table->enum('status', ['APPROVED', 'REJECTED', 'CONDITIONAL'])->default('APPROVED');
+            $table->text('comments')->nullable();
+            $table->timestamp('reviewed_at')->nullable();
+            $table->timestamps();
+
+            $table->index(['approvable_type', 'approvable_id']);
+        });
+
+        Schema::create('revisions', function (Blueprint $table) {
+            $table->id();
+            $table->string('revisionable_type');
+            $table->unsignedBigInteger('revisionable_id');
+            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
+            $table->text('description')->nullable();
+            $table->enum('status', ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'])->default('OPEN');
+            $table->timestamp('resolved_at')->nullable();
+            $table->timestamps();
+
+            $table->index(['revisionable_type', 'revisionable_id']);
+        });
+
+        Schema::create('timeline_activities', function (Blueprint $table) {
+            $table->id();
+            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
+            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
+            $table->string('activity_name');
+            $table->text('description')->nullable();
+            $table->date('start_date')->nullable();
+            $table->date('end_date')->nullable();
+            $table->enum('status', ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])->default('PLANNED');
+            $table->timestamps();
+        });
+    }
+
+    public function down(): void
+    {
+        Schema::dropIfExists('timeline_activities');
+        Schema::dropIfExists('revisions');
+        Schema::dropIfExists('approvals');
+    }
+};
