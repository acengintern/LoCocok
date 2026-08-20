<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\DummyNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_notifications()
    {
        $user = User::factory()->create();
        $user->notify(new DummyNotification());
        $user->notify(new DummyNotification());

        $response = $this->actingAs($user)->getJson('/api/v1/notifications');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => ['id', 'type', 'data', 'read_at', 'created_at']
                     ]
                 ])
                 ->assertJsonCount(2, 'data');
    }

    public function test_unread_count_works()
    {
        $user = User::factory()->create();
        $user->notify(new DummyNotification());
        $user->notify(new DummyNotification());

        // Both are unread initially
        $response = $this->actingAs($user)->getJson('/api/v1/notifications/unread-count');
        $response->assertStatus(200)
                 ->assertJsonPath('data.unread_count', 2);

        // Mark one as read
        $notification = $user->unreadNotifications->first();
        $notification->markAsRead();

        // Count should be 1
        $response = $this->actingAs($user)->getJson('/api/v1/notifications/unread-count');
        $response->assertStatus(200)
                 ->assertJsonPath('data.unread_count', 1);
    }

    public function test_marking_notification_as_read_works()
    {
        $user = User::factory()->create();
        $user->notify(new DummyNotification());

        $notification = $user->unreadNotifications->first();

        $response = $this->actingAs($user)->putJson('/api/v1/notifications/' . $notification->id . '/mark-read');

        $response->assertStatus(200);
        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_user_cannot_mark_another_users_notification_as_read()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $user1->notify(new DummyNotification());
        $notification = $user1->unreadNotifications->first();

        $response = $this->actingAs($user2)->putJson('/api/v1/notifications/' . $notification->id . '/mark-read');

        $response->assertStatus(403);
    }

    public function test_mark_all_read_works()
    {
        $user = User::factory()->create();
        $user->notify(new DummyNotification());
        $user->notify(new DummyNotification());

        $this->assertEquals(2, $user->unreadNotifications()->count());

        $response = $this->actingAs($user)->postJson('/api/v1/notifications/mark-all-read');

        $response->assertStatus(200);
        $this->assertEquals(0, $user->unreadNotifications()->count());
    }
}
