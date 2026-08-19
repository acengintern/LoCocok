<?php

namespace App\Enums;

enum ContentPlanStatus: string {
    case DRAFT = 'DRAFT';
    case REVIEW = 'REVIEW';
    case APPROVED = 'APPROVED';
    case CANCELLED = 'CANCELLED';
}
