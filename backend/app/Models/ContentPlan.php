<?php

namespace App\Models;

use App\Enums\ContentPlanStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasApprovalsAndRevisions;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class ContentPlan extends Model
{
    use HasFactory, SoftDeletes, LogsActivity, HasApprovalsAndRevisions;

    protected $guarded = [];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty();
    }

    protected function casts(): array
    {
        return [
            'status' => ContentPlanStatus::class,
            'posting_date' => 'date',
        ];
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scripts()
    {
        return $this->hasMany(Script::class);
    }

    public function outputType()
    {
        return $this->belongsTo(OutputType::class);
    }
}

