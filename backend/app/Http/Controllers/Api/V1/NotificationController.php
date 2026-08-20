<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use App\Http\Resources\NotificationResource;
use Illuminate\Support\Facades\Gate;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        Gate::authorize('viewAny', DatabaseNotification::class);

        $notifications = $request->user()->notifications()->paginate(15);
        return $this->successResponse(
            NotificationResource::collection($notifications),
            'Notifications retrieved successfully'
        );
    }

    public function unreadCount(Request $request)
    {
        Gate::authorize('viewAny', DatabaseNotification::class);

        $count = $request->user()->unreadNotifications()->count();
        return $this->successResponse(
            ['unread_count' => $count],
            'Unread notifications count retrieved successfully'
        );
    }

    public function markRead(Request $request, string $id)
    {
        $notification = DatabaseNotification::findOrFail($id);
        Gate::authorize('update', $notification);

        $notification->markAsRead();

        return $this->successResponse(
            new NotificationResource($notification),
            'Notification marked as read'
        );
    }

    public function markAllRead(Request $request)
    {
        Gate::authorize('viewAny', DatabaseNotification::class);

        $request->user()->unreadNotifications->markAsRead();

        return $this->successResponse(
            null,
            'All notifications marked as read'
        );
    }
}
