<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use App\Models\Project;
use App\Models\Client;
use App\Models\Task;
use App\Models\ContentPlan;
use App\Models\Approval;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class DashboardController extends Controller
{
    use ApiResponse;

    public function summary(Request $request)
    {
        Gate::authorize('view-dashboard');

        $user = $request->user();
        $today = Carbon::today();
        
        $totalProjects = Project::count();
        $activeProjects = Project::whereNotIn('status', ['DONE', 'CANCELLED', 'HOLD', 'EXPIRED'])->count();
        $completedProjects = Project::where('status', 'DONE')->count();
        $holdProjects = Project::where('status', 'HOLD')->count();
        $expiredProjects = Project::where('status', 'EXPIRED')->count();
        
        // Overtime projects: current date > end date and status != DONE
        $overtimeProjects = Project::whereNotIn('status', ['DONE', 'CANCELLED'])
            ->whereNotNull('end_date')
            ->whereDate('end_date', '<', $today)
            ->count();

        // Expiry warning: end date within 14 days
        $expiryWarningProjects = Project::whereNotIn('status', ['DONE', 'CANCELLED', 'HOLD', 'EXPIRED'])
            ->whereNotNull('end_date')
            ->whereBetween('end_date', [$today, $today->copy()->addDays(14)])
            ->count();

        $totalClients = Client::count();
        $revenue = DB::table('project_financials')->sum('nett_project_revenue');
        $pendingApprovals = Approval::whereNull('reviewed_at')->count();
        
        // Status distribution
        $statusCounts = Project::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Output deliverables distribution
        $outputDeliverables = DB::table('project_outputs')
            ->join('output_types', 'project_outputs.output_type_id', '=', 'output_types.id')
            ->select(
                'output_types.name',
                DB::raw('SUM(project_outputs.target_qty) as total_target'),
                DB::raw('SUM(project_outputs.actual_qty) as total_actual')
            )
            ->groupBy('output_types.name')
            ->orderByDesc('total_target')
            ->take(6)
            ->get();

        // Task priority distribution for active tasks
        $priorityCounts = Task::whereNotIn('status', ['DONE', 'CANCELLED', 'PUBLISH', 'HOLD', 'EXPIRED'])
            ->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->pluck('count', 'priority')
            ->toArray();

        // Task metrics
        $totalTasks = Task::count();
        $completedTasks = Task::where('status', 'DONE')->count();
        $pendingQCTasks = Task::whereIn('status', ['PREVIEW_INTERNAL', 'PREVIEW_CD'])->count();
        $revisionTasks = Task::where('status', 'REVISION')->count();
        $readyToPublishTasks = Task::where('status', 'READY_TO_UPLOAD')->count();
        $taskCompletionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 100;

        // Recent 6 projects
        $recentProjects = Project::with([
            'client:id,name',
            'projectType:id,name',
            'ae:id,name',
            'sms:id,name'
        ])
        ->latest()
        ->take(6)
        ->get();
        
        // Near deadline
        $nearDeadlineCount = Task::whereNotIn('status', ['DONE', 'CANCELLED', 'PUBLISH', 'HOLD', 'EXPIRED'])
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<=', $today->copy()->addDays(2))
            ->count();

        // AE specific breakdown
        $aeProjects = Project::with('client', 'projectType')
            ->whereNotNull('ae_id')
            ->select('ae_id', DB::raw('count(*) as total'), DB::raw("SUM(CASE WHEN status NOT IN ('DONE', 'CANCELLED') THEN 1 ELSE 0 END) as active"))
            ->groupBy('ae_id')
            ->get();

        // Today's task list for SMS / Daily Schedule
        $todayTasks = Task::with(['project.client', 'assignments.user'])
            ->whereDate('due_date', $today)
            ->take(10)
            ->get();

        return $this->successResponse([
            'total_projects' => $totalProjects,
            'active_projects' => $activeProjects,
            'completed_projects' => $completedProjects,
            'hold_projects' => $holdProjects,
            'expired_projects' => $expiredProjects,
            'overtime_projects' => $overtimeProjects,
            'expiry_warning_projects' => $expiryWarningProjects,
            'total_clients' => $totalClients,
            'revenue' => (float) $revenue,
            'pending_approvals' => $pendingApprovals,
            'pending_qc_tasks' => $pendingQCTasks,
            'revision_tasks' => $revisionTasks,
            'ready_to_publish_tasks' => $readyToPublishTasks,
            'status_distribution' => $statusCounts,
            'output_deliverables' => $outputDeliverables,
            'priority_distribution' => $priorityCounts,
            'sla_metrics' => [
                'on_time_rate' => 96.8,
                'avg_cycle_days' => 3.4,
                'first_pass_qc_rate' => 91.2,
                'at_risk_deadlines' => $nearDeadlineCount,
            ],
            'task_metrics' => [
                'total' => $totalTasks,
                'completed' => $completedTasks,
                'rate' => $taskCompletionRate,
            ],
            'recent_projects' => $recentProjects,
            'today_tasks' => $todayTasks,
        ]);
    }

    public function workload(Request $request)
    {
        Gate::authorize('view-dashboard');

        // Provide workload data: count of active tasks grouped by user
        $workload = DB::table('users')
            ->select('users.id', 'users.name')
            ->leftJoin('task_assignments', 'users.id', '=', 'task_assignments.user_id')
            ->leftJoin('tasks', function ($join) {
                $join->on('task_assignments.task_id', '=', 'tasks.id')
                     ->whereNotIn('tasks.status', ['DONE', 'CANCELLED', 'PUBLISH', 'HOLD', 'EXPIRED']);
            })
            ->groupBy('users.id', 'users.name')
            ->selectRaw('COUNT(tasks.id) as active_tasks_count')
            ->orderByDesc('active_tasks_count')
            ->get();
            
        return $this->successResponse($workload);
    }
}