<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Contract;
use App\Models\Project;
use App\Models\ProjectFinancial;
use App\Models\ProjectOutput;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\User;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    use ApiResponse;

    /**
     * 1. Project Overview Report
     */
    public function projectOverview(Request $request)
    {
        $query = Project::with(['client', 'projectType', 'ae', 'sms', 'outputs.outputType']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('project_type_id')) {
            $query->where('project_type_id', $request->project_type_id);
        }
        if ($request->filled('ae_id')) {
            $query->where('ae_id', $request->ae_id);
        }
        if ($request->filled('sms_id')) {
            $query->where('sms_id', $request->sms_id);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('project_code', 'like', "%{$s}%")
                  ->orWhereHas('client', function ($cq) use ($s) {
                      $cq->where('name', 'like', "%{$s}%");
                  });
            });
        }

        $projects = $query->latest()->get()->map(function ($p) {
            $today = Carbon::today();
            $endDate = $p->end_date ? Carbon::parse($p->end_date) : null;
            $remainingDays = $endDate ? (int) $today->diffInDays($endDate, false) : null;

            $totalTarget = $p->outputs->sum('target_qty');
            $totalActual = $p->outputs->sum('actual_qty');
            $totalRemaining = max(0, $totalTarget - $totalActual);
            $progressPct = $totalTarget > 0 ? round(($totalActual / $totalTarget) * 100, 1) : ($p->status === 'DONE' ? 100 : 0);

            // Overtime detection
            $isOvertime = ($p->status !== 'DONE' && $endDate && $today->greaterThan($endDate));

            return [
                'id' => $p->id,
                'project_code' => $p->project_code,
                'name' => $p->name,
                'client_name' => $p->client?->name ?? '-',
                'project_type' => $p->projectType?->name ?? '-',
                'ae_name' => $p->ae?->name ?? '-',
                'sms_name' => $p->sms?->name ?? '-',
                'status' => $p->status,
                'priority' => $p->priority,
                'start_date' => $p->start_date ? Carbon::parse($p->start_date)->format('Y-m-d') : null,
                'end_date' => $p->end_date ? Carbon::parse($p->end_date)->format('Y-m-d') : null,
                'remaining_days' => $remainingDays,
                'is_overtime' => $isOvertime,
                'target_output' => $totalTarget,
                'actual_output' => $totalActual,
                'remaining_output' => $totalRemaining,
                'progress_percentage' => $progressPct,
            ];
        });

        return $this->successResponse($projects, 'Project overview report retrieved successfully');
    }

    /**
     * 2. Workload & Team Performance Report
     */
    public function workloadSummary(Request $request)
    {
        $users = User::with(['roles'])->get();

        $teamPerformance = $users->map(function ($u) {
            $roleNames = $u->roles->pluck('name')->toArray();
            $primaryRole = !empty($roleNames) ? $roleNames[0] : 'Team Member';

            $totalTasks = TaskAssignment::where('user_id', $u->id)->count();
            $completedTasks = TaskAssignment::where('user_id', $u->id)
                ->whereHas('task', function ($q) {
                    $q->where('status', 'DONE');
                })->count();

            $onProgressTasks = TaskAssignment::where('user_id', $u->id)
                ->whereHas('task', function ($q) {
                    $q->whereIn('status', ['REQUEST', 'ON_PROGRESS', 'PREVIEW_INTERNAL', 'PREVIEW_CD', 'PREVIEW_CLIENT']);
                })->count();

            $revisionTasks = TaskAssignment::where('user_id', $u->id)
                ->whereHas('task', function ($q) {
                    $q->where('status', 'REVISION');
                })->count();

            $overdueTasks = TaskAssignment::where('user_id', $u->id)
                ->whereHas('task', function ($q) {
                    $q->where('status', 'OVERDUE')
                      ->orWhere(function ($sub) {
                          $sub->whereNotIn('status', ['DONE', 'CANCELLED'])
                              ->whereNotNull('due_date')
                              ->whereDate('due_date', '<', Carbon::today());
                      });
                })->count();

            $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 1) : 0;

            return [
                'user_id' => $u->id,
                'name' => $u->name,
                'username' => $u->username,
                'role' => $primaryRole,
                'total_tasks' => $totalTasks,
                'completed_tasks' => $completedTasks,
                'on_progress_tasks' => $onProgressTasks,
                'revision_tasks' => $revisionTasks,
                'overdue_tasks' => $overdueTasks,
                'completion_rate' => $completionRate,
            ];
        });

        // Designer vs Editor Filtered Workload
        $designers = $teamPerformance->filter(function ($item) {
            return stripos($item['role'], 'Designer') !== false || stripos($item['role'], 'Design') !== false;
        })->values();

        $editors = $teamPerformance->filter(function ($item) {
            return stripos($item['role'], 'Video') !== false || stripos($item['role'], 'Editor') !== false || stripos($item['role'], 'DAV') !== false;
        })->values();

        // Daily Workload Log (Monday Challenge Style)
        $dailyTasks = Task::with(['project.client', 'assignments.user', 'taskType', 'outputType'])
            ->latest()
            ->take(50)
            ->get()
            ->map(function ($t) {
                $assigneeNames = $t->assignments->map(fn($a) => $a->user?->name)->filter()->join(', ');
                return [
                    'id' => $t->id,
                    'task_no' => $t->task_no,
                    'title' => $t->title,
                    'project_name' => $t->project?->name ?? '-',
                    'client_name' => $t->project?->client?->name ?? '-',
                    'pic_ae' => $t->project?->ae?->name ?? '-',
                    'pic_sms' => $t->project?->sms?->name ?? '-',
                    'assignee' => $assigneeNames ?: 'Unassigned',
                    'due_date' => $t->due_date ? Carbon::parse($t->due_date)->format('Y-m-d') : '-',
                    'priority' => $t->priority,
                    'status' => $t->status,
                    'output_type' => $t->outputType?->name ?? $t->taskType?->name ?? '-',
                ];
            });

        return $this->successResponse([
            'team_performance' => $teamPerformance,
            'designer_workload' => $designers,
            'editor_workload' => $editors,
            'daily_workload' => $dailyTasks,
        ], 'Workload summary retrieved successfully');
    }

    /**
     * 3. Output Deliverables Report (Overall, SMM, OTP)
     */
    public function outputSummary(Request $request)
    {
        $outputs = ProjectOutput::with(['project.client', 'project.projectType', 'outputType'])->get();

        $overallOutputs = $outputs->map(function ($o) {
            $target = (int) $o->target_qty;
            $actual = (int) $o->actual_qty;
            $remaining = max(0, $target - $actual);
            $progress = $target > 0 ? round(($actual / $target) * 100, 1) : 0;

            return [
                'id' => $o->id,
                'project_name' => $o->project?->name ?? '-',
                'client_name' => $o->project?->client?->name ?? '-',
                'project_type' => $o->project?->projectType?->name ?? '-',
                'output_type' => $o->outputType?->name ?? 'General',
                'target' => $target,
                'realisation' => $actual,
                'remaining' => $remaining,
                'progress_percentage' => $progress,
                'status' => $o->status,
                'period' => $o->period ?? 'Periode 1',
            ];
        });

        // SMM Specific Outputs Grouped
        $smmOutputs = $overallOutputs->filter(function ($item) {
            return stripos($item['project_type'], 'Social Media') !== false;
        })->values();

        // OTP Specific Outputs Grouped
        $otpOutputs = $overallOutputs->filter(function ($item) {
            return stripos($item['project_type'], 'One Time') !== false || stripos($item['project_type'], 'OTP') !== false;
        })->values();

        return $this->successResponse([
            'overall_outputs' => $overallOutputs,
            'smm_outputs' => $smmOutputs,
            'otp_outputs' => $otpOutputs,
        ], 'Output summary retrieved successfully');
    }

    /**
     * 4. Timeline & Deadlines Monitoring Report
     */
    public function timelineDeadlines(Request $request)
    {
        $today = Carbon::today();

        // Overdue Tasks
        $overdueTasks = Task::with(['project.client', 'assignments.user'])
            ->whereNotIn('status', ['DONE', 'CANCELLED', 'PUBLISH'])
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<', $today)
            ->get()
            ->map(function ($t) use ($today) {
                $dueDate = Carbon::parse($t->due_date);
                $overdueDays = (int) $dueDate->diffInDays($today);
                $assignees = $t->assignments->map(fn($a) => $a->user?->name)->filter()->join(', ');

                return [
                    'id' => $t->id,
                    'task_no' => $t->task_no,
                    'title' => $t->title,
                    'project_name' => $t->project?->name ?? '-',
                    'client_name' => $t->project?->client?->name ?? '-',
                    'assignee' => $assignees ?: 'Unassigned',
                    'due_date' => $dueDate->format('Y-m-d'),
                    'overdue_days' => $overdueDays,
                    'priority' => $t->priority,
                    'status' => $t->status,
                ];
            });

        // Overtime Projects
        $overtimeProjects = Project::with(['client', 'ae', 'sms'])
            ->whereNotIn('status', ['DONE', 'CANCELLED'])
            ->whereNotNull('end_date')
            ->whereDate('end_date', '<', $today)
            ->get()
            ->map(function ($p) use ($today) {
                $endDate = Carbon::parse($p->end_date);
                $overtimeDays = (int) $endDate->diffInDays($today);

                return [
                    'id' => $p->id,
                    'project_code' => $p->project_code,
                    'name' => $p->name,
                    'client_name' => $p->client?->name ?? '-',
                    'ae_name' => $p->ae?->name ?? '-',
                    'sms_name' => $p->sms?->name ?? '-',
                    'end_date' => $endDate->format('Y-m-d'),
                    'overtime_days' => $overtimeDays,
                    'status' => $p->status,
                    'priority' => $p->priority,
                ];
            });

        // Deadlines breakdown
        $upcomingDeadlines = [
            'today' => Task::whereNotIn('status', ['DONE', 'CANCELLED'])->whereDate('due_date', $today)->count(),
            'tomorrow' => Task::whereNotIn('status', ['DONE', 'CANCELLED'])->whereDate('due_date', $today->copy()->addDay())->count(),
            'this_week' => Task::whereNotIn('status', ['DONE', 'CANCELLED'])->whereBetween('due_date', [$today, $today->copy()->endOfWeek()])->count(),
            'next_7_days' => Task::whereNotIn('status', ['DONE', 'CANCELLED'])->whereBetween('due_date', [$today, $today->copy()->addDays(7)])->count(),
            'next_14_days' => Task::whereNotIn('status', ['DONE', 'CANCELLED'])->whereBetween('due_date', [$today, $today->copy()->addDays(14)])->count(),
            'total_overdue' => $overdueTasks->count(),
        ];

        return $this->successResponse([
            'deadline_counts' => $upcomingDeadlines,
            'overdue_tasks' => $overdueTasks,
            'overtime_projects' => $overtimeProjects,
        ], 'Timeline & deadline reports retrieved successfully');
    }

    /**
     * 5. Client Summary Report (Active Clients & New Client per Month)
     */
    public function clientSummary(Request $request)
    {
        $clients = Client::with(['projects.contracts', 'picAe'])->get()->map(function ($c) {
            $activeProjectsCount = $c->projects->whereNotIn('status', ['DONE', 'CANCELLED'])->count();
            $totalProjectsCount = $c->projects->count();
            $latestContract = $c->projects->flatMap->contracts->sortByDesc('created_at')->first();

            return [
                'id' => $c->id,
                'name' => $c->name,
                'email' => $c->email ?? '-',
                'phone' => $c->phone ?? $c->contact ?? '-',
                'status' => $c->status,
                'pic_ae' => $c->picAe?->name ?? 'Unassigned',
                'active_projects' => $activeProjectsCount,
                'total_projects' => $totalProjectsCount,
                'contract_period' => $latestContract ? "{$latestContract->start_date} s/d {$latestContract->end_date}" : '-',
                'contract_value' => $latestContract ? (float) $latestContract->value : 0,
            ];
        });

        // Group by month
        $monthlyNewClients = Client::select(
            DB::raw("strftime('%Y-%m', created_at) as month"),
            DB::raw("count(*) as new_clients_count")
        )
        ->groupBy('month')
        ->orderByDesc('month')
        ->get();

        return $this->successResponse([
            'active_clients' => $clients,
            'new_clients_per_month' => $monthlyNewClients,
        ], 'Client summary report retrieved successfully');
    }

    /**
     * 6. Financial & Budget Report (Payment Client, Budget SMM, Budget OTP)
     */
    public function financialSummary(Request $request)
    {
        $financials = ProjectFinancial::with(['project.client', 'project.projectType'])->get();

        $clientPayments = $financials->map(function ($f) {
            $rev = (float) $f->project_revenue;
            $salesComm = (float) $f->sales_commission;
            $costOfSale = (float) ($f->cost_of_sale ?: $rev);
            $ppn = (float) $f->ppn;
            $pph = (float) $f->pph;
            $nettRev = (float) ($f->nett_project_revenue ?: ($rev - $salesComm - $ppn - $pph));
            $hpp = (float) ($f->hpp ?: ($rev * 0.4));
            $wbProd = (float) $f->working_budget_production;
            $wbCreative = (float) $f->working_budget_creative;
            $directCost = (float) $f->direct_project_cost;

            return [
                'id' => $f->id,
                'project_name' => $f->project?->name ?? '-',
                'client_name' => $f->project?->client?->name ?? '-',
                'project_type' => $f->project?->projectType?->name ?? '-',
                'progress' => $f->progress ?? ($f->project?->status === 'DONE' ? 100 : 50),
                'project_revenue' => $rev,
                'sales_commission' => $salesComm,
                'cost_of_sale' => $costOfSale,
                'ppn' => $ppn,
                'pph' => $pph,
                'nett_revenue' => $nettRev,
                'payment_status' => $f->payment_status ?? 'PAID',
                'hpp' => $hpp,
                'working_budget_production' => $wbProd,
                'working_budget_creative' => $wbCreative,
                'direct_project_cost' => $directCost,
            ];
        });

        $totalRevenue = $clientPayments->sum('project_revenue');
        $totalNettRevenue = $clientPayments->sum('nett_revenue');
        $totalHpp = $clientPayments->sum('hpp');
        $grossMargin = $totalRevenue > 0 ? round((($totalRevenue - $totalHpp) / $totalRevenue) * 100, 1) : 0;

        return $this->successResponse([
            'payments' => $clientPayments,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_nett_revenue' => $totalNettRevenue,
                'total_hpp' => $totalHpp,
                'gross_margin_percentage' => $grossMargin,
            ],
        ], 'Financial report retrieved successfully');
    }
}
