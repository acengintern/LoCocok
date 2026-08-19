<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('task_no')->unique();
            $table->string('title');
            $table->foreignId('task_type_id')->constrained()->cascadeOnDelete();
            $table->foreignId('output_type_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description')->nullable();
            $table->date('due_date')->nullable();
            $table->enum('priority', ['LOW', 'MID', 'HIGH', 'URGENT'])->default('MID');
            $table->enum('status', ['REQUEST', 'ON_PROGRESS', 'PREVIEW_INTERNAL', 'PREVIEW_CD', 'ACC_CD', 'PREVIEW_CLIENT', 'REVISION', 'READY_TO_UPLOAD', 'PUBLISH', 'DONE', 'HOLD', 'OVERDUE', 'EXPIRED', 'CANCELLED'])->default('REQUEST');
            $table->integer('quantity')->default(1);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('task_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->date('deadline')->nullable();
            $table->enum('priority', ['LOW', 'MID', 'HIGH', 'URGENT'])->default('MID');
            $table->text('extra_brief')->nullable();
            $table->text('personal_notes')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('task_id');
        });

        Schema::create('additional_loads', function (Blueprint $table) {
            $table->id();
            $table->date('date')->nullable();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('ae_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('task_type_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('output_type_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description')->nullable();
            $table->date('due_date')->nullable();
            $table->enum('priority', ['LOW', 'MID', 'HIGH', 'URGENT'])->default('MID');
            $table->enum('status', ['REQUEST', 'ON_PROGRESS', 'PREVIEW_INTERNAL', 'PREVIEW_CD', 'ACC_CD', 'PREVIEW_CLIENT', 'REVISION', 'READY_TO_UPLOAD', 'PUBLISH', 'DONE', 'HOLD', 'OVERDUE', 'EXPIRED', 'CANCELLED'])->default('REQUEST');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('additional_loads');
        Schema::dropIfExists('task_assignments');
        Schema::dropIfExists('tasks');
    }
};
