<?php

namespace Tests\Feature;

use App\Models\Pack;
use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PushSubscriptionTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    // ========================================
    // VAPID Key Tests
    // ========================================

    public function test_can_get_vapid_public_key(): void
    {
        // Skip if not configured
        if (!config('webpush.vapid.public_key')) {
            $this->markTestSkipped('VAPID keys not configured');
        }

        $response = $this->actingAs($this->user)
            ->getJson('/api/push/vapid-public-key');

        $response->assertOk()
            ->assertJsonStructure(['publicKey']);
    }

    public function test_vapid_endpoint_requires_authentication(): void
    {
        $response = $this->getJson('/api/push/vapid-public-key');

        $response->assertUnauthorized();
    }

    // ========================================
    // Subscribe Tests
    // ========================================

    public function test_user_can_subscribe_to_push_notifications(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/push/subscribe', [
                'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
                'keys' => [
                    'p256dh' => 'test-p256dh-key',
                    'auth' => 'test-auth-key',
                ],
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => $this->user->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
        ]);
    }

    public function test_subscribe_requires_endpoint(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/push/subscribe', [
                'keys' => [
                    'p256dh' => 'test-p256dh-key',
                    'auth' => 'test-auth-key',
                ],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['endpoint']);
    }

    public function test_subscribe_requires_keys(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/push/subscribe', [
                'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['keys']);
    }

    public function test_subscribe_updates_existing_subscription(): void
    {
        // Create initial subscription
        PushSubscription::create([
            'user_id' => $this->user->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
            'p256dh_key' => 'old-p256dh-key',
            'auth_token' => 'old-auth-key',
        ]);

        // Subscribe again with same endpoint
        $response = $this->actingAs($this->user)
            ->postJson('/api/push/subscribe', [
                'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
                'keys' => [
                    'p256dh' => 'new-p256dh-key',
                    'auth' => 'new-auth-key',
                ],
            ]);

        $response->assertOk();

        // Should only have one subscription
        $this->assertDatabaseCount('push_subscriptions', 1);

        // Should have updated keys
        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => $this->user->id,
            'p256dh_key' => 'new-p256dh-key',
        ]);
    }

    public function test_user_can_have_multiple_subscriptions_different_endpoints(): void
    {
        // Subscribe first device
        $this->actingAs($this->user)
            ->postJson('/api/push/subscribe', [
                'endpoint' => 'https://fcm.googleapis.com/fcm/send/device-1',
                'keys' => [
                    'p256dh' => 'key-1',
                    'auth' => 'auth-1',
                ],
            ]);

        // Subscribe second device
        $this->actingAs($this->user)
            ->postJson('/api/push/subscribe', [
                'endpoint' => 'https://fcm.googleapis.com/fcm/send/device-2',
                'keys' => [
                    'p256dh' => 'key-2',
                    'auth' => 'auth-2',
                ],
            ]);

        $this->assertDatabaseCount('push_subscriptions', 2);
    }

    // ========================================
    // Unsubscribe Tests
    // ========================================

    public function test_user_can_unsubscribe_from_push_notifications(): void
    {
        PushSubscription::create([
            'user_id' => $this->user->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
            'p256dh_key' => 'test-p256dh-key',
            'auth_token' => 'test-auth-key',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/push/unsubscribe', [
                'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
            ]);

        $response->assertOk();

        $this->assertDatabaseMissing('push_subscriptions', [
            'user_id' => $this->user->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
        ]);
    }

    public function test_unsubscribe_requires_endpoint(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/push/unsubscribe', []);

        // API returns 400 Bad Request for missing endpoint
        $response->assertStatus(400);
    }

    public function test_unsubscribe_removes_subscription_by_endpoint(): void
    {
        // Create subscription for current user
        PushSubscription::create([
            'user_id' => $this->user->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/my-endpoint',
            'p256dh_key' => 'test-p256dh-key',
            'auth_token' => 'test-auth-key',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/push/unsubscribe', [
                'endpoint' => 'https://fcm.googleapis.com/fcm/send/my-endpoint',
            ]);

        $response->assertOk();

        $this->assertDatabaseMissing('push_subscriptions', [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/my-endpoint',
        ]);
    }

    public function test_unsubscribe_nonexistent_endpoint_returns_not_found(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/push/unsubscribe', [
                'endpoint' => 'https://fcm.googleapis.com/fcm/send/nonexistent',
            ]);

        $response->assertNotFound();
    }

    // ========================================
    // Authorization Tests
    // ========================================

    public function test_subscribe_requires_authentication(): void
    {
        $response = $this->postJson('/api/push/subscribe', [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
            'keys' => [
                'p256dh' => 'test-p256dh-key',
                'auth' => 'test-auth-key',
            ],
        ]);

        $response->assertUnauthorized();
    }

    public function test_unsubscribe_requires_authentication(): void
    {
        $response = $this->postJson('/api/push/unsubscribe', [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
        ]);

        $response->assertUnauthorized();
    }
}
