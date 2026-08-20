<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasApprovalsAndRevisions;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class File extends Model
{
    use HasFactory, SoftDeletes, LogsActivity, HasApprovalsAndRevisions;

    protected $guarded = [];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty();
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function fileType()
    {
        return $this->belongsTo(FileType::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function currentVersion()
    {
        return $this->belongsTo(FileVersion::class, 'current_version_id');
    }

    public function versions()
    {
        return $this->hasMany(FileVersion::class);
    }
}

