<?php

namespace App\Traits;

use App\Models\Approval;
use App\Models\Revision;

trait HasApprovalsAndRevisions
{
    public function approvals()
    {
        return $this->morphMany(Approval::class, 'approvable');
    }

    public function revisions()
    {
        return $this->morphMany(Revision::class, 'revisionable');
    }
}
