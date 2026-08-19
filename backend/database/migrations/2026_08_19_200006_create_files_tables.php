<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('task_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->foreignId('file_type_id')->constrained()->cascadeOnDelete();
            $table->string('path')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('current_version_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('file_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('file_id')->constrained()->cascadeOnDelete();
            $table->integer('version_number');
            $table->string('path')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('approval_status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->text('revision_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['file_id', 'version_number']);
        });

        Schema::table('files', function (Blueprint $table) {
            $table->foreign('current_version_id')->references('id')->on('file_versions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('files', function (Blueprint $table) {
            $table->dropForeign(['current_version_id']);
        });
        Schema::dropIfExists('file_versions');
        Schema::dropIfExists('files');
    }
};
