<?php

namespace App\Enums;

enum RevisionStatus: string {
    case OPEN = 'OPEN';
    case IN_PROGRESS = 'IN_PROGRESS';
    case RESOLVED = 'RESOLVED';
    case CANCELLED = 'CANCELLED';
}
