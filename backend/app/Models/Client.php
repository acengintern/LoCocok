<?php

namespace App\Models;

use App\Enums\ClientStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'status' => ClientStatus::class,
        ];
    }

    public function picAe()
    {
        return $this->belongsTo(User::class, 'pic_ae_id');
    }

    public function picSms()
    {
        return $this->belongsTo(User::class, 'pic_sms_id');
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }
}
