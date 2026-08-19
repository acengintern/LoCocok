<?php

$dir = 'app/Policies/';

$pol1 = <<<'EOD'
<?php

namespace App\Policies;

use App\Models\ProjectFinancial;
use App\Models\User;

class ProjectFinancialPolicy
{
    public function manage(User $user, ProjectFinancial $projectFinancial = null): bool
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
    public function manage(User $user, ProjectPayment $projectPayment = null): bool
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
    public function manage(User $user, ProjectCost $projectCost = null): bool
    {
        return $user->hasPermissionTo('manage');
    }
}
EOD;

file_put_contents($dir.'ProjectFinancialPolicy.php', $pol1);
file_put_contents($dir.'ProjectPaymentPolicy.php', $pol2);
file_put_contents($dir.'ProjectCostPolicy.php', $pol3);
