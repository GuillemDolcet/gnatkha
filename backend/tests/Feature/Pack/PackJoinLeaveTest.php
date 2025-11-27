<?php

namespace Tests\Feature\Pack;

use App\Models\Pack;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PackJoinLeaveTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $admin;
    private Pack $pack;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->admin = User::factory()->create();
        $this->pack = Pack::factory()->create();
        $this->pack->members()->attach($this->admin->id, ['is_admin' => true]);
    }

    public function test_user_can_join_pack_with_valid_code(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/packs/join', [
                'invitation_code' => $this->pack->invitation_code,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', $this->pack->name)
            ->assertJsonPath('data.is_admin', false);

        $this->assertDatabaseHas('user_pack', [
            'user_id' => $this->user->id,
            'pack_id' => $this->pack->id,
            'is_admin' => false,
        ]);
    }

    public function test_user_cannot_join_pack_with_invalid_code(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/packs/join', [
                'invitation_code' => 'INVALID1',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['invitation_code']);
    }

    public function test_user_cannot_join_pack_they_already_belong_to(): void
    {
        $this->pack->members()->attach($this->user->id, ['is_admin' => false]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/packs/join', [
                'invitation_code' => $this->pack->invitation_code,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['invitation_code']);
    }

    public function test_invitation_code_must_be_8_characters(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/packs/join', [
                'invitation_code' => 'SHORT',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['invitation_code']);
    }

    public function test_member_can_leave_pack(): void
    {
        $this->pack->members()->attach($this->user->id, ['is_admin' => false]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/packs/{$this->pack->id}/leave");

        $response->assertNoContent();

        $this->assertDatabaseMissing('user_pack', [
            'user_id' => $this->user->id,
            'pack_id' => $this->pack->id,
        ]);
    }

    public function test_admin_cannot_leave_pack(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/packs/{$this->pack->id}/leave");

        $response->assertForbidden();

        $this->assertDatabaseHas('user_pack', [
            'user_id' => $this->admin->id,
            'pack_id' => $this->pack->id,
        ]);
    }

    public function test_user_cannot_leave_pack_they_dont_belong_to(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/packs/{$this->pack->id}/leave");

        $response->assertForbidden();
    }
}
