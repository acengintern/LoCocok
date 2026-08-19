<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approvals', function (Blueprint $table) {
            $table->id();
            $table->string('approvable_type');
            $table->unsignedBigInteger('approvable_id');
            $table->enum('approval_type', ['INTERNAL_QC', 'CD_REVIEW', 'CLIENT_REVIEW']);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('client_name')->nullable();
            $table->enum('status', ['APPROVED', 'REJECTED', 'CONDITIONAL'])->default('APPROVED');
            $table->text('comments')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['approvable_type', 'approvable_id']);
        });

        Schema::create('revisions', function (Blueprint $table) {
            $table->id();
            $table->string('revisionable_type');
            $table->unsignedBigInteger('revisionable_id');
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('description')->nullable();
            $table->enum('status', ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'])->default('OPEN');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['revisionable_type', 'revisionable_id']);
        });

        Schema::create('timeline_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('activity_name');
            $table->text('description')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('status', ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])->default('PLANNED');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timeline_activities');
        Schema::dropIfExists('revisions');
        Schema::dropIfExists('approvals');
    }
};
