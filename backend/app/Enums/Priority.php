<?php

namespace App\Enums;

enum Priority: string {
    case LOW = 'LOW';
    case MID = 'MID';
    case HIGH = 'HIGH';
    case URGENT = 'URGENT';
}
