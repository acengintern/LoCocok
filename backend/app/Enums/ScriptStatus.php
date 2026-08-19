<?php

namespace App\Enums;

enum ScriptStatus: string {
    case IDEATION = 'IDEATION';
    case DRAFT = 'DRAFT';
    case REVIEW = 'REVIEW';
    case APPROVED = 'APPROVED';
    case READY_TO_SHOOT = 'READY_TO_SHOOT';
    case CANCELLED = 'CANCELLED';
}
