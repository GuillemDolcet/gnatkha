<?php

namespace Tests\Feature\Animal;

use App\Models\Animal;
use App\Models\AnimalType;
use App\Models\Pack;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AnimalCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Pack $pack;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\AnimalTypeSeeder::class);

        $this->user = User::factory()->create();
        $this->pack = Pack::factory()->create();
        $this->pack->members()->attach($this->user->id, ['is_admin' => true]);
    }

    public function test_user_can_list_animals_in_their_pack(): void
    {
        $animal = Animal::factory()->create(['pack_id' => $this->pack->id]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/packs/{$this->pack->id}/animals");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', $animal->name);
    }

    public function test_user_can_list_all_their_animals(): void
    {
        $animal1 = Animal::factory()->create(['pack_id' => $this->pack->id]);

        $pack2 = Pack::factory()->create();
        $pack2->members()->attach($this->user->id, ['is_admin' => false]);
        $animal2 = Animal::factory()->create(['pack_id' => $pack2->id]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/animals');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_user_cannot_list_animals_from_pack_they_dont_belong_to(): void
    {
        $otherPack = Pack::factory()->create();
        Animal::factory()->create(['pack_id' => $otherPack->id]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/packs/{$otherPack->id}/animals");

        $response->assertForbidden();
    }

    public function test_user_can_create_animal(): void
    {
        $animalType = AnimalType::where('key', 'dog')->first();

        $response = $this->actingAs($this->user)
            ->postJson('/api/animals', [
                'pack_id' => $this->pack->id,
                'animal_type_id' => $animalType->id,
                'name' => 'Max',
                'breed' => 'Labrador',
                'sex' => 'male',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Max')
            ->assertJsonPath('data.breed', 'Labrador');

        $this->assertDatabaseHas('animals', [
            'pack_id' => $this->pack->id,
            'name' => 'Max',
        ]);
    }

    public function test_user_can_create_animal_with_image(): void
    {
        Storage::fake('public');

        $animalType = AnimalType::first();

        $response = $this->actingAs($this->user)
            ->postJson('/api/animals', [
                'pack_id' => $this->pack->id,
                'animal_type_id' => $animalType->id,
                'name' => 'Luna',
                'sex' => 'female',
                'image' => UploadedFile::fake()->image('pet.jpg'),
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Luna');

        $animal = Animal::where('name', 'Luna')->first();
        $this->assertNotNull($animal->image_path);
    }

    public function test_animal_creation_requires_name(): void
    {
        $animalType = AnimalType::first();

        $response = $this->actingAs($this->user)
            ->postJson('/api/animals', [
                'pack_id' => $this->pack->id,
                'animal_type_id' => $animalType->id,
                'sex' => 'male',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_animal_creation_requires_valid_sex(): void
    {
        $animalType = AnimalType::first();

        $response = $this->actingAs($this->user)
            ->postJson('/api/animals', [
                'pack_id' => $this->pack->id,
                'animal_type_id' => $animalType->id,
                'name' => 'Test',
                'sex' => 'invalid',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['sex']);
    }

    public function test_user_cannot_create_animal_in_pack_they_dont_belong_to(): void
    {
        $otherPack = Pack::factory()->create();
        $animalType = AnimalType::first();

        $response = $this->actingAs($this->user)
            ->postJson('/api/animals', [
                'pack_id' => $otherPack->id,
                'animal_type_id' => $animalType->id,
                'name' => 'Max',
                'sex' => 'male',
            ]);

        $response->assertForbidden();
    }

    public function test_user_can_view_animal_from_their_pack(): void
    {
        $animal = Animal::factory()->create(['pack_id' => $this->pack->id]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/animals/{$animal->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $animal->id)
            ->assertJsonPath('data.name', $animal->name);
    }

    public function test_user_cannot_view_animal_from_other_pack(): void
    {
        $otherPack = Pack::factory()->create();
        $animal = Animal::factory()->create(['pack_id' => $otherPack->id]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/animals/{$animal->id}");

        $response->assertForbidden();
    }

    public function test_user_can_update_animal(): void
    {
        $animal = Animal::factory()->create([
            'pack_id' => $this->pack->id,
            'name' => 'Old Name',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/animals/{$animal->id}", [
                'animal_type_id' => $animal->animal_type_id,
                'name' => 'New Name',
                'sex' => $animal->sex,
                'weight' => 25.5,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'New Name');

        $this->assertDatabaseHas('animals', [
            'id' => $animal->id,
            'name' => 'New Name',
        ]);
    }

    public function test_user_cannot_update_animal_from_other_pack(): void
    {
        $otherPack = Pack::factory()->create();
        $animal = Animal::factory()->create(['pack_id' => $otherPack->id]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/animals/{$animal->id}", [
                'name' => 'Hacked Name',
            ]);

        $response->assertForbidden();
    }

    public function test_admin_can_delete_animal(): void
    {
        $animal = Animal::factory()->create(['pack_id' => $this->pack->id]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/animals/{$animal->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('animals', ['id' => $animal->id]);
    }

    public function test_non_admin_cannot_delete_animal(): void
    {
        $pack = Pack::factory()->create();
        $pack->members()->attach($this->user->id, ['is_admin' => false]);

        $animal = Animal::factory()->create(['pack_id' => $pack->id]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/animals/{$animal->id}");

        $response->assertForbidden();
    }

    public function test_deleting_animal_removes_related_reminders(): void
    {
        $animal = Animal::factory()->create(['pack_id' => $this->pack->id]);

        $this->seed(\Database\Seeders\TaskTypeSeeder::class);

        \App\Models\Reminder::factory()->create([
            'animal_id' => $animal->id,
            'created_by' => $this->user->id,
        ]);

        $this->actingAs($this->user)
            ->deleteJson("/api/animals/{$animal->id}");

        $this->assertDatabaseMissing('reminders', ['animal_id' => $animal->id]);
    }

    public function test_animal_birth_date_calculates_age_correctly(): void
    {
        $animal = Animal::factory()->create([
            'pack_id' => $this->pack->id,
            'birth_date' => now()->subYears(3)->subMonths(6),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/animals/{$animal->id}");

        $response->assertOk()
            ->assertJsonPath('data.birth_date', $animal->birth_date->format('Y-m-d'));
    }
}
