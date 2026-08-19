<?php

$dir = 'app/Policies/';

$pol1 = <<<'EOD'
<?php

namespace App\Policies;

use App\Models\ProjectFinancial;
use App\Models\User;

class ProjectFinancialPolicy
{
    public function view(User $user, ProjectFinancial $projectFinancial): bool
    {
        return $user->hasPermissionTo('manage');
    }

    public function update(User $user, ProjectFinancial $projectFinancial): bool
    {
        return $user->hasPermissionTo('manage');
    }
}
EOD;

$pol2 = <<<'EOD'
<?php

namespace App\Policies;

use App\Models\ProjectPayment;
use App\Models\User;

class ProjectPaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('manage');
    }

    public function view(User $user, ProjectPayment $projectPayment): bool
    {
        return $user->hasPermissionTo('manage');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('manage');
    }

    public function update(User $user, ProjectPayment $projectPayment): bool
    {
        return $user->hasPermissionTo('manage');
    }

    public function delete(User $user, ProjectPayment $projectPayment): bool
    {
        return $user->hasPermissionTo('manage');
    }
}
EOD;

$pol3 = <<<'EOD'
<?php

namespace App\Policies;

use App\Models\ProjectCost;
use App\Models\User;

class ProjectCostPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('manage');
    }

    public function view(User $user, ProjectCost $projectCost): bool
    {
        return $user->hasPermissionTo('manage');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('manage');
    }

    public function update(User $user, ProjectCost $projectCost): bool
    {
        return $user->hasPermissionTo('manage');
    }

    public function delete(User $user, ProjectCost $projectCost): bool
    {
        return $user->hasPermissionTo('manage');
    }
}
EOD;

file_put_contents($dir.'ProjectFinancialPolicy.php', $pol1);
file_put_contents($dir.'ProjectPaymentPolicy.php', $pol2);
file_put_contents($dir.'ProjectCostPolicy.php', $pol3);
