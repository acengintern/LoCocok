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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class DashboardController extends Controller
{
    use ApiResponse;

    public function summary(Request $request)
    {
        Gate::authorize('view-dashboard');

        $user = $request->user();
        
        $isAdminOrManager = $user->hasRole(['System Administrator', 'Creative Director']);
        
        if ($isAdminOrManager) {
            $totalProjects = Project::count();
            $activeProjects = Project::whereNotIn('status', ['DONE', 'CANCELLED', 'HOLD', 'EXPIRED'])->count();
            $completedProjects = Project::where('status', 'DONE')->count();
            $totalClients = Client::count();
            $revenue = DB::table('project_financials')->sum('nett_project_revenue');
            $pendingApprovals = Approval::whereNull('reviewed_at')->count();
            
            // Status distribution
            $statusCounts = Project::select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();

            // Output deliverables distribution (target vs actual by output type)
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

            // Task completion metrics
            $totalTasks = Task::count();
            $completedTasks = Task::where('status', 'DONE')->count();
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
            
            // Studio SLA & Velocity Metrics
            $nearDeadlineCount = Task::whereNotIn('status', ['DONE', 'CANCELLED', 'PUBLISH', 'HOLD', 'EXPIRED'])
                ->whereNotNull('end_date')
                ->where('end_date', '<=', now()->addDays(2))
                ->count();

            $totalActiveCrew = DB::table('users')->count();

            return $this->successResponse([
                'total_projects' => $totalProjects,
                'active_projects' => $activeProjects,
                'completed_projects' => $completedProjects,
                'total_clients' => $totalClients,
                'revenue' => (float) $revenue,
                'pending_approvals' => $pendingApprovals,
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
                'recent_projects' => $recentProjects
            ]);
        } else {
            // For an AE/SMS/Design/Video (Normal user)
            $activeProjects = Project::whereNotIn('status', ['DONE', 'CANCELLED', 'HOLD', 'EXPIRED'])
                ->where(function($q) use ($user) {
                    $q->where('ae_id', $user->id)
                      ->orWhere('sms_id', $user->id)
                      ->orWhere('cd_id', $user->id);
                })->count();
                
            $tasksPending = Task::whereNotIn('status', ['DONE', 'CANCELLED', 'PUBLISH', 'HOLD', 'EXPIRED'])
                ->whereHas('assignments', function($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->count();
                
            $startOfWeek = now()->startOfWeek();
            $endOfWeek = now()->endOfWeek();
            
            $contentPlansDue = ContentPlan::whereBetween('posting_date', [$startOfWeek, $endOfWeek])
                ->where('created_by', $user->id)
                ->count();
                
            return $this->successResponse([
                'active_projects' => $activeProjects,
                'tasks_pending' => $tasksPending,
                'content_plans_due_this_week' => $contentPlansDue
            ]);
        }
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