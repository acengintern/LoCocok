<?php

namespace App\Models;

use App\Enums\Priority;
use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'priority' => Priority::class,
            'status' => ProjectStatus::class,
            'start_date' => 'date',
            'end_date' => 'date',
            'actual_end_date' => 'date',
        ];
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function projectType()
    {
        return $this->belongsTo(ProjectType::class);
    }

    public function ae()
    {
        return $this->belongsTo(User::class, 'ae_id');
    }

    public function sms()
    {
        return $this->belongsTo(User::class, 'sms_id');
    }

    public function creativeDirector()
    {
        return $this->belongsTo(User::class, 'cd_id');
    }

    public function financial()
    {
        return $this->hasOne(ProjectFinancial::class);
    }

    public function payments()
    {
        return $this->hasMany(ProjectPayment::class);
    }

    public function costs()
    {
        return $this->hasMany(ProjectCost::class);
    }

    public function outputs()
    {
        return $this->hasMany(ProjectOutput::class);
    }

    public function briefs()
    {
        return $this->hasMany(Brief::class);
    }

    public function contentPlans()
    {
        return $this->hasMany(ContentPlan::class);
    }

    public function scripts()
    {
        return $this->hasMany(Script::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function timelineActivities()
    {
        return $this->hasMany(TimelineActivity::class);
    }

    public function additionalLoads()
    {
        return $this->hasMany(AdditionalLoad::class);
    }
}
