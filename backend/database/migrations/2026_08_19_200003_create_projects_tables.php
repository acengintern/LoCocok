<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('project_code')->nullable();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->foreignId('project_type_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ae_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('sms_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('cd_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('priority', ['LOW', 'MID', 'HIGH', 'URGENT'])->default('MID');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->date('actual_end_date')->nullable();
            $table->enum('status', ['BRIEF_RECEIVED', 'CONTENT_PLANNING', 'SCRIPT_READY', 'DESIGN', 'EDITING', 'QC_INTERNAL', 'CLIENT_REVIEW', 'REVISION', 'APPROVED', 'PUBLISHED', 'DONE', 'HOLD', 'EXPIRED', 'OVERTIME', 'CANCELLED'])->default('BRIEF_RECEIVED');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('ae_id');
            $table->index('client_id');
        });

        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->string('mou_number')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('value', 15, 2)->nullable();
            $table->string('file_path')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('project_financials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->decimal('project_revenue', 15, 2)->default(0);
            $table->decimal('sales_commission', 15, 2)->default(0);
            $table->decimal('cost_of_sale', 15, 2)->default(0);
            $table->decimal('ppn', 15, 2)->default(0);
            $table->decimal('pph', 15, 2)->default(0);
            $table->decimal('nett_project_revenue', 15, 2)->default(0);
            $table->decimal('hpp', 15, 2)->default(0);
            $table->decimal('working_budget_production', 15, 2)->default(0);
            $table->decimal('working_budget_creative', 15, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->unique('project_id');
        });

        Schema::create('project_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->date('payment_date')->nullable();
            $table->enum('status', ['PENDING', 'PARTIAL', 'PAID', 'CANCELLED'])->default('PENDING');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('project_costs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('description');
            $table->decimal('amount', 15, 2);
            $table->enum('cost_type', ['PRODUCTION', 'CREATIVE', 'DIRECT', 'OTHER'])->default('OTHER');
            $table->date('incurred_at')->nullable();
            $table->timestamps();
        });

        Schema::create('project_outputs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('output_type_id')->constrained()->cascadeOnDelete();
            $table->string('period')->nullable();
            $table->integer('target_qty')->default(0);
            $table->integer('actual_qty')->default(0);
            $table->timestamps();

            $table->unique(['project_id', 'output_type_id', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_outputs');
        Schema::dropIfExists('project_costs');
        Schema::dropIfExists('project_payments');
        Schema::dropIfExists('project_financials');
        Schema::dropIfExists('contracts');
        Schema::dropIfExists('projects');
    }
};
