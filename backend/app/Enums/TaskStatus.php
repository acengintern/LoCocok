<?php

namespace App\Enums;

enum TaskStatus: string {
    case REQUEST = 'REQUEST';
    case ON_PROGRESS = 'ON_PROGRESS';
    case PREVIEW_INTERNAL = 'PREVIEW_INTERNAL';
    case PREVIEW_CD = 'PREVIEW_CD';
    case ACC_CD = 'ACC_CD';
    case PREVIEW_CLIENT = 'PREVIEW_CLIENT';
    case REVISION = 'REVISION';
    case READY_TO_UPLOAD = 'READY_TO_UPLOAD';
    case PUBLISH = 'PUBLISH';
    case DONE = 'DONE';
    case HOLD = 'HOLD';
    case OVERDUE = 'OVERDUE';
    case EXPIRED = 'EXPIRED';
    case CANCELLED = 'CANCELLED';
}
