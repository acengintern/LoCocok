<?php

namespace App\Models;

use App\Enums\ApprovalStatus;
use App\Enums\ApprovalType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Approval extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'approval_type' => ApprovalType::class,
            'status' => ApprovalStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    public function approvable()
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
