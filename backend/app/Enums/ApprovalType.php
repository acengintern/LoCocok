<?php

namespace App\Enums;

enum ApprovalType: string {
    case INTERNAL_QC = 'INTERNAL_QC';
    case CD_REVIEW = 'CD_REVIEW';
    case CLIENT_REVIEW = 'CLIENT_REVIEW';
}
