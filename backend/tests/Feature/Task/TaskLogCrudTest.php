<?php

namespace Tests\Feature\Task;

use App\Models\Animal;
use App\Models\Pack;
use App\Models\Reminder;
use App\Models\TaskLog;
use App\Models\TaskType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskLogCrudTest extends TestCase
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

    public function test_user_can_list_task_logs_for_animal(): void
    {
        $log = TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/animals/{$this->animal->id}/logs");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', $log->title);
    }

    public function test_user_can_list_todays_task_logs(): void
    {
        TaskLog::factory()->today()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
        ]);

        TaskLog::factory()->yesterday()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/logs/today');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_user_cannot_list_logs_for_animal_in_other_pack(): void
    {
        $otherPack = Pack::factory()->create();
        $otherAnimal = Animal::factory()->create(['pack_id' => $otherPack->id]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/animals/{$otherAnimal->id}/logs");

        $response->assertForbidden();
    }

    public function test_user_can_create_task_log(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/logs', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Fed the dog',
                'completed_at' => now()->format('Y-m-d H:i:s'),
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Fed the dog')
            ->assertJsonPath('data.user.id', $this->user->id);

        $this->assertDatabaseHas('task_logs', [
            'animal_id' => $this->animal->id,
            'title' => 'Fed the dog',
        ]);
    }

    public function test_user_can_create_task_log_with_notes(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/logs', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Walk',
                'notes' => 'Walked for 30 minutes in the park',
                'completed_at' => now()->format('Y-m-d H:i:s'),
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.notes', 'Walked for 30 minutes in the park');
    }

    public function test_user_can_create_task_log_from_reminder(): void
    {
        $reminder = Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'title' => 'Morning feed',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/logs', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'reminder_id' => $reminder->id,
                'title' => 'Morning feed',
                'completed_at' => now()->format('Y-m-d H:i:s'),
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.reminder_id', $reminder->id);
    }

    public function test_task_log_creation_requires_title(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/logs', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'completed_at' => now()->format('Y-m-d H:i:s'),
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['title']);
    }

    public function test_task_log_completed_at_defaults_to_now(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/logs', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Test without date',
            ]);

        $response->assertCreated();

        $log = TaskLog::where('title', 'Test without date')->first();
        $this->assertNotNull($log->completed_at);
    }

    public function test_user_cannot_create_log_for_animal_in_other_pack(): void
    {
        $otherPack = Pack::factory()->create();
        $otherAnimal = Animal::factory()->create(['pack_id' => $otherPack->id]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/logs', [
                'animal_id' => $otherAnimal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Hacked log',
                'completed_at' => now()->format('Y-m-d H:i:s'),
            ]);

        $response->assertForbidden();
    }

    public function test_user_can_update_own_task_log(): void
    {
        $log = TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'title' => 'Old Title',
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/logs/{$log->id}", [
                'task_type_id' => $this->taskType->id,
                'title' => 'New Title',
                'notes' => 'Added some notes',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.title', 'New Title');
    }

    public function test_non_admin_cannot_update_other_users_task_log(): void
    {
        // Create a non-admin user
        $nonAdminUser = User::factory()->create();
        $this->pack->members()->attach($nonAdminUser->id, ['is_admin' => false]);

        $log = TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id, // Created by admin
            'task_type_id' => $this->taskType->id,
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($nonAdminUser)
            ->putJson("/api/logs/{$log->id}", [
                'title' => 'Hacked',
            ]);

        $response->assertForbidden();
    }

    public function test_user_can_delete_own_task_log(): void
    {
        $log = TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/logs/{$log->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('task_logs', ['id' => $log->id]);
    }

    public function test_non_admin_cannot_delete_other_users_task_log(): void
    {
        // Create a non-admin user
        $nonAdminUser = User::factory()->create();
        $this->pack->members()->attach($nonAdminUser->id, ['is_admin' => false]);

        $log = TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id, // Created by admin
            'task_type_id' => $this->taskType->id,
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($nonAdminUser)
            ->deleteJson("/api/logs/{$log->id}");

        $response->assertForbidden();
    }

    public function test_task_log_cannot_reference_invalid_reminder(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/logs', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'reminder_id' => 99999,
                'title' => 'Test',
                'completed_at' => now()->format('Y-m-d H:i:s'),
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['reminder_id']);
    }

    public function test_task_logs_ordered_by_completed_at_descending(): void
    {
        TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'title' => 'First',
            'completed_at' => now()->subHours(2),
        ]);

        TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'title' => 'Second',
            'completed_at' => now()->subHour(),
        ]);

        TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'title' => 'Third',
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/animals/{$this->animal->id}/logs");

        $response->assertOk()
            ->assertJsonPath('data.0.title', 'Third')
            ->assertJsonPath('data.1.title', 'Second')
            ->assertJsonPath('data.2.title', 'First');
    }

    public function test_can_limit_task_logs_returned(): void
    {
        TaskLog::factory()->count(10)->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/animals/{$this->animal->id}/logs/recent?limit=5");

        $response->assertOk()
            ->assertJsonCount(5, 'data');
    }
}
