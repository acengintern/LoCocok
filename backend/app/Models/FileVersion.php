<?php

namespace App\Models;

use App\Enums\FileVersionApprovalStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasApprovalsAndRevisions;

class FileVersion extends Model
{
    use HasFactory, HasApprovalsAndRevisions;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'approval_status' => FileVersionApprovalStatus::class,
        ];
    }

    public function file()
    {
        return $this->belongsTo(File::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}

