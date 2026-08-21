<?php

namespace App\Models;

use App\Enums\UserStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
        'avatar',
        'phone',
        'bio',
        'division',
        'status',
        'join_date',
        'google_id',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => UserStatus::class,
        ];
    }

    public function teams()
    {
        return $this->belongsToMany(Team::class, 'team_members')
                    ->using(TeamMember::class)
                    ->withTimestamps();
    }

    public function clientPicAes()
    {
        return $this->hasMany(Client::class, 'pic_ae_id');
    }

    public function clientPicSms()
    {
        return $this->hasMany(Client::class, 'pic_sms_id');
    }

    public function projectAes()
    {
        return $this->hasMany(Project::class, 'ae_id');
    }

    public function projectSms()
    {
        return $this->hasMany(Project::class, 'sms_id');
    }

    public function projectCds()
    {
        return $this->hasMany(Project::class, 'cd_id');
    }

    public function briefs()
    {
        return $this->hasMany(Brief::class, 'created_by');
    }

    public function contentPlans()
    {
        return $this->hasMany(ContentPlan::class, 'created_by');
    }

    public function scripts()
    {
        return $this->hasMany(Script::class, 'created_by');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    public function taskAssignments()
    {
        return $this->hasMany(TaskAssignment::class, 'user_id');
    }

    public function assignedTasks()
    {
        return $this->hasMany(TaskAssignment::class, 'assigned_by');
    }

    public function additionalLoadsAe()
    {
        return $this->hasMany(AdditionalLoad::class, 'ae_id');
    }

    public function additionalLoadsAssigned()
    {
        return $this->hasMany(AdditionalLoad::class, 'assigned_user_id');
    }

    public function files()
    {
        return $this->hasMany(File::class, 'uploaded_by');
    }

    public function fileVersions()
    {
        return $this->hasMany(FileVersion::class, 'uploaded_by');
    }

    public function approvals()
    {
        return $this->hasMany(Approval::class);
    }

    public function revisions()
    {
        return $this->hasMany(Revision::class, 'requested_by');
    }

    public function timelineActivities()
    {
        return $this->hasMany(TimelineActivity::class);
    }
}
