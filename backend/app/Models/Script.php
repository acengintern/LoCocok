<?php

namespace App\Models;

use App\Enums\ScriptStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Script extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'status' => ScriptStatus::class,
        ];
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function contentPlan()
    {
        return $this->belongsTo(ContentPlan::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
