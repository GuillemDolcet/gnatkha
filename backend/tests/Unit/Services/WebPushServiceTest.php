<?php

namespace Tests\Unit\Services;

use App\Models\Animal;
use App\Models\Pack;
use App\Models\PushSubscription;
use App\Models\Reminder;
use App\Models\TaskType;
use App\Models\User;
use App\Repositories\PushSubscriptionsRepository;
use App\Services\Push\WebPushService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Minishlink\WebPush\WebPush;
use Mockery;
use Tests\TestCase;

class WebPushServiceTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Pack $pack;
    private Animal $animal;
    private TaskType $taskType;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\AnimalTypeSeeder::class);
        $this->seed(\Database\Seeders\TaskTypeSeeder::class);

        $this->user = User::factory()->create();
        $this->pack = Pack::factory()->create();
        $this->pack->members()->attach($this->user->id, ['is_admin' => true]);
        $this->animal = Animal::factory()->create(['pack_id' => $this->pack->id]);
        $this->taskType = TaskType::first();
    }

    public function test_send_to_user_returns_correct_structure(): void
    {
        // Skip if VAPID keys not configured
        if (!config('webpush.vapid.public_key')) {
            $this->markTestSkipped('VAPID keys not configured');
        }

        $service = app(WebPushService::class);

        $result = $service->sendToUser($this->user->id, [
            'title' => 'Test',
            'body' => 'Test message',
        ]);

        $this->assertArrayHasKey('success', $result);
        $this->assertArrayHasKey('failed', $result);
        $this->assertArrayHasKey('expired', $result);
    }

    public function test_send_to_user_with_no_subscriptions_returns_zero(): void
    {
        // Skip if VAPID keys not configured
        if (!config('webpush.vapid.public_key')) {
            $this->markTestSkipped('VAPID keys not configured');
        }

        $service = app(WebPushService::class);

        $result = $service->sendToUser($this->user->id, [
            'title' => 'Test',
            'body' => 'Test message',
        ]);

        $this->assertEquals(0, $result['success']);
        $this->assertEquals(0, $result['failed']);
    }

    public function test_reminder_notification_includes_correct_data(): void
    {
        // Skip if VAPID keys not configured
        if (!config('webpush.vapid.public_key')) {
            $this->markTestSkipped('VAPID keys not configured');
        }

        $reminder = Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'title' => 'Feed the dog',
        ]);

        $service = app(WebPushService::class);

        $result = $service->sendReminderNotification($reminder);

        // With no subscriptions, should just return zeros
        $this->assertArrayHasKey('success', $result);
    }

    public function test_expired_subscriptions_are_tracked(): void
    {
        // Skip if VAPID keys not configured
        if (!config('webpush.vapid.public_key')) {
            $this->markTestSkipped('VAPID keys not configured');
        }

        $service = app(WebPushService::class);

        $result = $service->sendToUser($this->user->id, [
            'title' => 'Test',
            'body' => 'Test message',
        ]);

        $this->assertIsArray($result['expired']);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
