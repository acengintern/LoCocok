<?php

namespace App\Enums;

enum ApprovalStatus: string {
    case APPROVED = 'APPROVED';
    case REJECTED = 'REJECTED';
    case CONDITIONAL = 'CONDITIONAL';
}
