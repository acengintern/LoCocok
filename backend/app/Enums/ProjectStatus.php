<?php

namespace App\Enums;

enum ProjectStatus: string {
    case BRIEF_RECEIVED = 'BRIEF_RECEIVED';
    case CONTENT_PLANNING = 'CONTENT_PLANNING';
    case SCRIPT_READY = 'SCRIPT_READY';
    case DESIGN = 'DESIGN';
    case EDITING = 'EDITING';
    case QC_INTERNAL = 'QC_INTERNAL';
    case CLIENT_REVIEW = 'CLIENT_REVIEW';
    case REVISION = 'REVISION';
    case APPROVED = 'APPROVED';
    case PUBLISHED = 'PUBLISHED';
    case DONE = 'DONE';
    case HOLD = 'HOLD';
    case EXPIRED = 'EXPIRED';
    case OVERTIME = 'OVERTIME';
    case CANCELLED = 'CANCELLED';
}
