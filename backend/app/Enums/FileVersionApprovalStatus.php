<?php

namespace App\Enums;

enum FileVersionApprovalStatus: string {
    case PENDING = 'PENDING';
    case APPROVED = 'APPROVED';
    case REJECTED = 'REJECTED';
}
