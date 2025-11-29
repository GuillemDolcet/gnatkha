<?php

namespace Tests\Unit\Models;

use App\Models\Animal;
use App\Models\Pack;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PackTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\AnimalTypeSeeder::class);
    }

    // ========================================
    // Relationship Tests
    // ========================================

    public function test_pack_has_many_members(): void
    {
        $pack = Pack::factory()->create();
        $users = User::factory()->count(3)->create();

        foreach ($users as $user) {
            $pack->members()->attach($user->id, ['is_admin' => false]);
        }

        $this->assertCount(3, $pack->members);
        $this->assertInstanceOf(User::class, $pack->members->first());
    }

    public function test_pack_has_many_animals(): void
    {
        $pack = Pack::factory()->create();
        Animal::factory()->count(4)->create(['pack_id' => $pack->id]);

        $this->assertCount(4, $pack->animals);
        $this->assertInstanceOf(Animal::class, $pack->animals->first());
    }

    // ========================================
    // Invitation Code Tests
    // ========================================

    public function test_pack_generates_unique_invitation_code(): void
    {
        $pack1 = Pack::factory()->create();
        $pack2 = Pack::factory()->create();

        $this->assertNotNull($pack1->invitation_code);
        $this->assertNotNull($pack2->invitation_code);
        $this->assertNotEquals($pack1->invitation_code, $pack2->invitation_code);
    }

    public function test_invitation_code_is_8_characters(): void
    {
        $pack = Pack::factory()->create();

        $this->assertEquals(8, strlen($pack->invitation_code));
    }

    public function test_invitation_code_is_alphanumeric(): void
    {
        $pack = Pack::factory()->create();

        $this->assertMatchesRegularExpression('/^[A-Za-z0-9]+$/', $pack->invitation_code);
    }

    // ========================================
    // Admin Tests
    // ========================================

    public function test_pack_can_have_admin(): void
    {
        $pack = Pack::factory()->create();
        $admin = User::factory()->create();
        $member = User::factory()->create();

        $pack->members()->attach($admin->id, ['is_admin' => true]);
        $pack->members()->attach($member->id, ['is_admin' => false]);

        $adminPivot = $pack->members()->where('user_id', $admin->id)->first()->pivot;
        $memberPivot = $pack->members()->where('user_id', $member->id)->first()->pivot;

        $this->assertTrue((bool) $adminPivot->is_admin);
        $this->assertFalse((bool) $memberPivot->is_admin);
    }

    // ========================================
    // Cascade Delete Tests
    // ========================================

    public function test_deleting_pack_deletes_animals(): void
    {
        $pack = Pack::factory()->create();
        $animal = Animal::factory()->create(['pack_id' => $pack->id]);
        $animalId = $animal->id;

        $pack->delete();

        $this->assertDatabaseMissing('animals', ['id' => $animalId]);
    }

    public function test_deleting_pack_removes_member_associations(): void
    {
        $pack = Pack::factory()->create();
        $user = User::factory()->create();
        $pack->members()->attach($user->id, ['is_admin' => true]);
        $packId = $pack->id;

        $pack->delete();

        $this->assertDatabaseMissing('user_pack', ['pack_id' => $packId]);
    }

    // ========================================
    // Attribute Tests
    // ========================================

    public function test_pack_name_is_required(): void
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        Pack::create(['name' => null]);
    }

    public function test_pack_timestamps_are_set(): void
    {
        $pack = Pack::factory()->create();

        $this->assertNotNull($pack->created_at);
        $this->assertNotNull($pack->updated_at);
    }
}
