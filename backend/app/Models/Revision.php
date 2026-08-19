<?php

namespace App\Models;

use App\Enums\RevisionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Revision extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'status' => RevisionStatus::class,
            'resolved_at' => 'datetime',
        ];
    }

    public function revisionable()
    {
        return $this->morphTo();
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
