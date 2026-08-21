<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of system activity logs for Superadmin.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Allow System Administrator and Creative Director
        if ($user && method_exists($user, 'hasRole') && !$user->hasRole('System Administrator') && !$user->hasRole('Creative Director')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to activity logs.',
            ], 403);
        }

        $query = Activity::with(['causer', 'subject'])->latest();

        if ($request->filled('event')) {
            $query->where('event', $request->query('event'));
        }

        if ($request->filled('log_name')) {
            $query->where('log_name', $request->query('log_name'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('log_name', 'like', "%{$search}%")
                  ->orWhere('event', 'like', "%{$search}%");
            });
        }

        $limit = $request->integer('limit', 50);
        $activities = $query->paginate($limit);

        return response()->json([
            'success' => true,
            'data'    => $activities->items(),
            'meta'    => [
                'current_page' => $activities->currentPage(),
                'last_page'    => $activities->lastPage(),
                'per_page'     => $activities->perPage(),
                'total'        => $activities->total(),
            ],
        ]);
    }
}
