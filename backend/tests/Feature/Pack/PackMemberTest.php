<?php

namespace Tests\Feature\Pack;

use App\Models\Pack;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PackMemberTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $member;
    private User $outsider;
    private Pack $pack;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create();
        $this->member = User::factory()->create();
        $this->outsider = User::factory()->create();
        $this->pack = Pack::factory()->create();
        $this->pack->members()->attach($this->admin->id, ['is_admin' => true]);
        $this->pack->members()->attach($this->member->id, ['is_admin' => false]);
    }

    public function test_member_can_list_pack_members(): void
    {
        $response = $this->actingAs($this->member)
            ->getJson("/api/packs/{$this->pack->id}/members");

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_outsider_cannot_list_pack_members(): void
    {
        $response = $this->actingAs($this->outsider)
            ->getJson("/api/packs/{$this->pack->id}/members");

        $response->assertForbidden();
    }

    public function test_admin_can_remove_member(): void
    {
        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/packs/{$this->pack->id}/members/{$this->member->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('user_pack', [
            'user_id' => $this->member->id,
            'pack_id' => $this->pack->id,
        ]);
    }

    public function test_admin_cannot_remove_themselves(): void
    {
        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/packs/{$this->pack->id}/members/{$this->admin->id}");

        $response->assertForbidden();
    }

    public function test_member_cannot_remove_other_members(): void
    {
        $anotherMember = User::factory()->create();
        $this->pack->members()->attach($anotherMember->id, ['is_admin' => false]);

        $response = $this->actingAs($this->member)
            ->deleteJson("/api/packs/{$this->pack->id}/members/{$anotherMember->id}");

        $response->assertForbidden();
    }

    public function test_cannot_remove_user_who_is_not_member(): void
    {
        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/packs/{$this->pack->id}/members/{$this->outsider->id}");

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['user']);
    }

    public function test_admin_can_transfer_admin_role(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/packs/{$this->pack->id}/members/{$this->member->id}/transfer-admin");

        $response->assertNoContent();

        $this->assertDatabaseHas('user_pack', [
            'user_id' => $this->admin->id,
            'pack_id' => $this->pack->id,
            'is_admin' => false,
        ]);

        $this->assertDatabaseHas('user_pack', [
            'user_id' => $this->member->id,
            'pack_id' => $this->pack->id,
            'is_admin' => true,
        ]);
    }

    public function test_admin_cannot_transfer_admin_to_themselves(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/packs/{$this->pack->id}/members/{$this->admin->id}/transfer-admin");

        $response->assertForbidden();
    }

    public function test_member_cannot_transfer_admin_role(): void
    {
        $anotherMember = User::factory()->create();
        $this->pack->members()->attach($anotherMember->id, ['is_admin' => false]);

        $response = $this->actingAs($this->member)
            ->postJson("/api/packs/{$this->pack->id}/members/{$anotherMember->id}/transfer-admin");

        $response->assertForbidden();
    }

    public function test_cannot_transfer_admin_to_non_member(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/packs/{$this->pack->id}/members/{$this->outsider->id}/transfer-admin");

        // La Policy rechaza porque el outsider no es miembro del pack
        $response->assertForbidden();
    }

    public function test_after_admin_transfer_old_admin_can_leave(): void
    {
        $this->actingAs($this->admin)
            ->postJson("/api/packs/{$this->pack->id}/members/{$this->member->id}/transfer-admin");

        $response = $this->actingAs($this->admin)
            ->postJson("/api/packs/{$this->pack->id}/leave");

        $response->assertNoContent();
    }
}
