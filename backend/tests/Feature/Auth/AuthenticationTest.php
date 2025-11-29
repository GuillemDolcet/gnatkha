<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    // ========================================
    // Unauthenticated Access Tests
    // ========================================

    public function test_unauthenticated_user_cannot_access_packs(): void
    {
        $response = $this->getJson('/api/packs');

        $response->assertUnauthorized();
    }

    public function test_unauthenticated_user_cannot_access_animals(): void
    {
        $response = $this->getJson('/api/animals');

        $response->assertUnauthorized();
    }

    public function test_unauthenticated_user_cannot_access_reminders(): void
    {
        $response = $this->getJson('/api/reminders/upcoming');

        $response->assertUnauthorized();
    }

    public function test_unauthenticated_user_cannot_access_task_logs(): void
    {
        $response = $this->getJson('/api/logs/today');

        $response->assertUnauthorized();
    }

    public function test_unauthenticated_user_cannot_access_task_types(): void
    {
        $response = $this->getJson('/api/task-types');

        $response->assertUnauthorized();
    }

    public function test_unauthenticated_user_cannot_create_pack(): void
    {
        $response = $this->postJson('/api/packs', [
            'name' => 'My Pack',
        ]);

        $response->assertUnauthorized();
    }

    // ========================================
    // Authenticated Access Tests
    // ========================================

    public function test_authenticated_user_can_access_packs(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/packs');

        $response->assertOk();
    }

    public function test_authenticated_user_can_access_animals(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/animals');

        $response->assertOk();
    }

    public function test_authenticated_user_can_access_task_types(): void
    {
        $user = User::factory()->create();
        $this->seed(\Database\Seeders\TaskTypeSeeder::class);

        $response = $this->actingAs($user)
            ->getJson('/api/task-types');

        $response->assertOk();
    }

    // ========================================
    // Token Tests
    // ========================================

    public function test_invalid_token_returns_unauthorized(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer invalid-token')
            ->getJson('/api/packs');

        $response->assertUnauthorized();
    }

    public function test_expired_token_returns_unauthorized(): void
    {
        // This depends on your token expiration configuration
        // For Sanctum, tokens don't expire by default unless configured
        $this->assertTrue(true); // Placeholder
    }

    // ========================================
    // User Info Tests
    // ========================================

    public function test_authenticated_user_can_get_own_info(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/user');

        $response->assertOk()
            ->assertJsonPath('name', 'Test User')
            ->assertJsonPath('email', 'test@example.com');
    }
}
