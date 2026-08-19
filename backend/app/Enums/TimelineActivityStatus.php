<?php

namespace App\Enums;

enum TimelineActivityStatus: string {
    case PLANNED = 'PLANNED';
    case IN_PROGRESS = 'IN_PROGRESS';
    case COMPLETED = 'COMPLETED';
    case CANCELLED = 'CANCELLED';
}
