<?php

namespace Tests\Feature\Task;

use App\Models\Animal;
use App\Models\Pack;
use App\Models\Reminder;
use App\Models\TaskType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReminderCrudTest extends TestCase
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

    public function test_user_can_list_reminders_for_animal(): void
    {
        $reminder = Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/animals/{$this->animal->id}/reminders");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', $reminder->title);
    }

    public function test_user_can_list_upcoming_reminders(): void
    {
        Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'is_active' => true,
            'next_occurrence' => now()->addDays(3),
        ]);

        Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'is_active' => true,
            'next_occurrence' => now()->addDays(10),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/reminders/upcoming?days=7');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_user_cannot_list_reminders_for_animal_in_other_pack(): void
    {
        $otherPack = Pack::factory()->create();
        $otherAnimal = Animal::factory()->create(['pack_id' => $otherPack->id]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/animals/{$otherAnimal->id}/reminders");

        $response->assertForbidden();
    }

    public function test_user_can_create_daily_reminder(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/reminders', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Feed the dog',
                'frequency' => 'daily',
                'time_of_day' => '09:00',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Feed the dog')
            ->assertJsonPath('data.frequency', 'daily')
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('reminders', [
            'animal_id' => $this->animal->id,
            'title' => 'Feed the dog',
        ]);
    }

    public function test_user_can_create_weekly_reminder(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/reminders', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Bath time',
                'frequency' => 'weekly',
                'day_of_week' => 6,
                'time_of_day' => '10:00',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.frequency', 'weekly')
            ->assertJsonPath('data.day_of_week', 6);
    }

    public function test_user_can_create_monthly_reminder(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/reminders', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Flea treatment',
                'frequency' => 'monthly',
                'day_of_month' => 15,
                'time_of_day' => '09:00',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.frequency', 'monthly')
            ->assertJsonPath('data.day_of_month', 15);
    }

    public function test_user_can_create_one_time_reminder(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/reminders', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Vet appointment',
                'frequency' => 'once',
                'specific_date' => now()->addDays(7)->format('Y-m-d'),
                'time_of_day' => '14:30',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.frequency', 'once');
    }

    public function test_reminder_creation_requires_title(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/reminders', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'frequency' => 'daily',
                'time_of_day' => '09:00',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['title']);
    }

    public function test_weekly_reminder_requires_day_of_week(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/reminders', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Test',
                'frequency' => 'weekly',
                'time_of_day' => '09:00',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['day_of_week']);
    }

    public function test_monthly_reminder_requires_day_of_month(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/reminders', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Test',
                'frequency' => 'monthly',
                'time_of_day' => '09:00',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['day_of_month']);
    }

    public function test_once_reminder_requires_specific_date(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/reminders', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Test',
                'frequency' => 'once',
                'time_of_day' => '09:00',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['specific_date']);
    }

    public function test_user_cannot_create_reminder_for_animal_in_other_pack(): void
    {
        $otherPack = Pack::factory()->create();
        $otherAnimal = Animal::factory()->create(['pack_id' => $otherPack->id]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/reminders', [
                'animal_id' => $otherAnimal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Hacked reminder',
                'frequency' => 'daily',
                'time_of_day' => '09:00',
            ]);

        $response->assertForbidden();
    }

    public function test_user_can_update_reminder(): void
    {
        $reminder = Reminder::factory()->daily()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'title' => 'Old Title',
            'time_of_day' => '09:00',
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/reminders/{$reminder->id}", [
                'task_type_id' => $this->taskType->id,
                'title' => 'New Title',
                'description' => 'Updated description',
                'frequency' => 'daily',
                'time_of_day' => '10:00',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.title', 'New Title')
            ->assertJsonPath('data.description', 'Updated description');
    }

    public function test_user_cannot_update_reminder_in_other_pack(): void
    {
        $otherPack = Pack::factory()->create();
        $otherAnimal = Animal::factory()->create(['pack_id' => $otherPack->id]);
        $otherUser = User::factory()->create();

        $reminder = Reminder::factory()->create([
            'animal_id' => $otherAnimal->id,
            'created_by' => $otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/reminders/{$reminder->id}", [
                'title' => 'Hacked',
            ]);

        $response->assertForbidden();
    }

    public function test_user_can_toggle_reminder_active_state(): void
    {
        $reminder = Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/reminders/{$reminder->id}/toggle");

        $response->assertOk()
            ->assertJsonPath('data.is_active', false);

        $response = $this->actingAs($this->user)
            ->postJson("/api/reminders/{$reminder->id}/toggle");

        $response->assertOk()
            ->assertJsonPath('data.is_active', true);
    }

    public function test_user_can_delete_reminder(): void
    {
        $reminder = Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/reminders/{$reminder->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('reminders', ['id' => $reminder->id]);
    }

    public function test_user_cannot_delete_reminder_in_other_pack(): void
    {
        $otherPack = Pack::factory()->create();
        $otherAnimal = Animal::factory()->create(['pack_id' => $otherPack->id]);
        $otherUser = User::factory()->create();

        $reminder = Reminder::factory()->create([
            'animal_id' => $otherAnimal->id,
            'created_by' => $otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/reminders/{$reminder->id}");

        $response->assertForbidden();
    }

    public function test_reminder_calculates_next_occurrence_on_create(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/reminders', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Daily task',
                'frequency' => 'daily',
                'time_of_day' => '09:00',
            ]);

        $response->assertCreated();

        $reminder = Reminder::where('title', 'Daily task')->first();
        $this->assertNotNull($reminder->next_occurrence);
    }

    public function test_inactive_reminders_not_included_in_upcoming(): void
    {
        Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'is_active' => false,
            'next_occurrence' => now()->addDays(1),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/reminders/upcoming?days=7');

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }
}
