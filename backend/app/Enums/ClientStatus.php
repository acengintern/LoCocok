<?php

namespace App\Enums;

enum ClientStatus: string {
    case ACTIVE = 'ACTIVE';
    case INACTIVE = 'INACTIVE';
    case PROSPECT = 'PROSPECT';
}
