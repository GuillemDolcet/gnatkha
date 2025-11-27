<?php

namespace Tests\Feature\Pack;

use App\Models\Pack;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PackCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_user_can_list_their_packs(): void
    {
        $pack = Pack::factory()->create();
        $pack->members()->attach($this->user->id, ['is_admin' => true]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/packs');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', $pack->name);
    }

    public function test_user_can_create_pack(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/packs', [
                'name' => 'Mi Manada',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Mi Manada')
            ->assertJsonPath('data.is_admin', true)
            ->assertJsonPath('data.members_count', 1);

        $this->assertDatabaseHas('packs', ['name' => 'Mi Manada']);
        $this->assertDatabaseHas('user_pack', [
            'user_id' => $this->user->id,
            'is_admin' => true,
        ]);
    }

    public function test_pack_creation_requires_name(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/packs', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_pack_name_must_be_at_least_2_characters(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/packs', [
                'name' => 'A',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_user_can_view_pack_they_belong_to(): void
    {
        $pack = Pack::factory()->create();
        $pack->members()->attach($this->user->id, ['is_admin' => false]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/packs/{$pack->id}");

        $response->assertOk()
            ->assertJsonPath('data.name', $pack->name);
    }

    public function test_user_cannot_view_pack_they_dont_belong_to(): void
    {
        $pack = Pack::factory()->create();

        $response = $this->actingAs($this->user)
            ->getJson("/api/packs/{$pack->id}");

        $response->assertForbidden();
    }

    public function test_admin_can_update_pack(): void
    {
        $pack = Pack::factory()->create(['name' => 'Old Name']);
        $pack->members()->attach($this->user->id, ['is_admin' => true]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/packs/{$pack->id}", [
                'name' => 'New Name',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'New Name');

        $this->assertDatabaseHas('packs', ['id' => $pack->id, 'name' => 'New Name']);
    }

    public function test_non_admin_cannot_update_pack(): void
    {
        $pack = Pack::factory()->create();
        $pack->members()->attach($this->user->id, ['is_admin' => false]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/packs/{$pack->id}", [
                'name' => 'New Name',
            ]);

        $response->assertForbidden();
    }

    public function test_admin_can_delete_pack(): void
    {
        $pack = Pack::factory()->create();
        $pack->members()->attach($this->user->id, ['is_admin' => true]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/packs/{$pack->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('packs', ['id' => $pack->id]);
        $this->assertDatabaseMissing('user_pack', ['pack_id' => $pack->id]);
    }

    public function test_non_admin_cannot_delete_pack(): void
    {
        $pack = Pack::factory()->create();
        $pack->members()->attach($this->user->id, ['is_admin' => false]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/packs/{$pack->id}");

        $response->assertForbidden();
    }

    public function test_pack_has_unique_invitation_code(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/packs', ['name' => 'Pack 1']);

        $this->actingAs($this->user)
            ->postJson('/api/packs', ['name' => 'Pack 2']);

        $codes = Pack::pluck('invitation_code')->toArray();
        $this->assertCount(2, array_unique($codes));
    }
}
