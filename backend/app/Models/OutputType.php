<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OutputType extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function projectOutputs()
    {
        return $this->hasMany(ProjectOutput::class);
    }
}
