<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('briefs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->text('brief_text')->nullable();
            $table->text('objective')->nullable();
            $table->string('platform')->nullable();
            $table->text('content_requirement')->nullable();
            $table->text('reference')->nullable();
            $table->date('deadline')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('content_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('content_pillar')->nullable();
            $table->string('content_type')->nullable();
            $table->text('ideation')->nullable();
            $table->text('caption')->nullable();
            $table->string('platform')->nullable();
            $table->date('posting_date')->nullable();
            $table->text('reference')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['DRAFT', 'REVIEW', 'APPROVED', 'CANCELLED'])->default('DRAFT');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('scripts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('content_plan_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('content_type')->nullable();
            $table->text('hook')->nullable();
            $table->text('concept')->nullable();
            $table->text('script_text')->nullable();
            $table->text('reference')->nullable();
            $table->string('talent')->nullable();
            $table->string('location')->nullable();
            $table->string('cta')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['IDEATION', 'DRAFT', 'REVIEW', 'APPROVED', 'READY_TO_SHOOT', 'CANCELLED'])->default('IDEATION');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scripts');
        Schema::dropIfExists('content_plans');
        Schema::dropIfExists('briefs');
    }
};
