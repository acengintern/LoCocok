<?php

namespace App\Enums;

enum CostType: string {
    case PRODUCTION = 'PRODUCTION';
    case CREATIVE = 'CREATIVE';
    case DIRECT = 'DIRECT';
    case OTHER = 'OTHER';
}
