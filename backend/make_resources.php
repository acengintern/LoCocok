<?php

$dir = 'app/Http/Resources/';

$res1 = <<<'EOD'
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectFinancialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }
}
EOD;

$res2 = <<<'EOD'
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectPaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }
}
EOD;

$res3 = <<<'EOD'
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectCostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }
}
EOD;

file_put_contents($dir.'ProjectFinancialResource.php', $res1);
file_put_contents($dir.'ProjectPaymentResource.php', $res2);
file_put_contents($dir.'ProjectCostResource.php', $res3);
