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
            
            return $this->successResponse([
                'total_projects' => $totalProjects,
                'active_projects' => $activeProjects,
                'completed_projects' => $completedProjects,
                'total_clients' => $totalClients,
                'revenue' => (float) $revenue,
                'pending_approvals' => $pendingApprovals,
                'status_distribution' => $statusCounts,
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
            ->get();
            
        return $this->successResponse($workload);
    }
}