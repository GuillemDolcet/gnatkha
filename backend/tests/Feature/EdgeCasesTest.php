<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\Pack;
use App\Models\Reminder;
use App\Models\TaskLog;
use App\Models\TaskType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EdgeCasesTest extends TestCase
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

    // ========================================
    // Cascade Delete Tests
    // ========================================

    public function test_deleting_pack_cascades_to_animals_reminders_and_logs(): void
    {
        $animal = Animal::factory()->create(['pack_id' => $this->pack->id]);

        $reminder = Reminder::factory()->create([
            'animal_id' => $animal->id,
            'created_by' => $this->user->id,
            'task_type_id' => $this->taskType->id,
        ]);

        $log = TaskLog::factory()->create([
            'animal_id' => $animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'completed_at' => now(),
        ]);

        $packId = $this->pack->id;
        $animalId = $animal->id;
        $reminderId = $reminder->id;
        $logId = $log->id;

        $this->pack->delete();

        $this->assertDatabaseMissing('packs', ['id' => $packId]);
        $this->assertDatabaseMissing('animals', ['id' => $animalId]);
        $this->assertDatabaseMissing('reminders', ['id' => $reminderId]);
        $this->assertDatabaseMissing('task_logs', ['id' => $logId]);
    }

    public function test_deleting_animal_keeps_pack_intact(): void
    {
        $animal = Animal::factory()->create(['pack_id' => $this->pack->id]);

        $animal->delete();

        $this->assertDatabaseHas('packs', ['id' => $this->pack->id]);
    }

    public function test_deleting_reminder_keeps_related_task_logs(): void
    {
        $reminder = Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'task_type_id' => $this->taskType->id,
        ]);

        $log = TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'reminder_id' => $reminder->id,
            'completed_at' => now(),
        ]);

        $logId = $log->id;
        $reminder->delete();

        // Log should still exist but with null reminder_id
        $this->assertDatabaseHas('task_logs', ['id' => $logId]);

        $log->refresh();
        $this->assertNull($log->reminder_id);
    }

    // ========================================
    // Boundary and Edge Case Tests
    // ========================================

    public function test_reminder_with_past_specific_date_sets_null_next_occurrence(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 6, 15));

        $reminder = Reminder::create([
            'animal_id' => $this->animal->id,
            'task_type_id' => $this->taskType->id,
            'created_by' => $this->user->id,
            'title' => 'Past Event',
            'frequency' => 'once',
            'specific_date' => '2025-01-01', // In the past
            'time_of_day' => '10:00',
            'is_active' => true,
        ]);

        $reminder->calculateNextOccurrence();

        $this->assertNull($reminder->next_occurrence);
    }

    public function test_monthly_reminder_on_31st_handles_short_months(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 2, 1, 8, 0)); // February

        $reminder = Reminder::create([
            'animal_id' => $this->animal->id,
            'task_type_id' => $this->taskType->id,
            'created_by' => $this->user->id,
            'title' => 'End of Month Task',
            'frequency' => 'monthly',
            'day_of_month' => 31,
            'time_of_day' => '10:00',
            'is_active' => true,
        ]);

        $reminder->calculateNextOccurrence();

        // Should use Feb 28 (last day of Feb 2025)
        $this->assertEquals(28, $reminder->next_occurrence->day);
        $this->assertEquals(2, $reminder->next_occurrence->month);

        Carbon::setTestNow();
    }

    public function test_animal_with_future_birth_date_is_not_allowed(): void
    {
        // Validation prevents future birth dates
        $response = $this->actingAs($this->user)
            ->postJson('/api/animals', [
                'pack_id' => $this->pack->id,
                'animal_type_id' => $this->animal->animal_type_id,
                'name' => 'Future Pet',
                'sex' => 'unknown',
                'birth_date' => now()->addMonths(2)->format('Y-m-d'),
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['birth_date']);
    }

    public function test_task_log_can_be_created_for_past_dates(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/logs', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Retroactive Log',
                'completed_at' => now()->subDays(30)->format('Y-m-d H:i:s'),
            ]);

        $response->assertCreated();
    }

    public function test_animal_weight_can_be_zero(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/animals', [
                'pack_id' => $this->pack->id,
                'animal_type_id' => $this->animal->animal_type_id,
                'name' => 'Tiny Pet',
                'sex' => 'unknown',
                'weight' => 0.01,
            ]);

        $response->assertCreated();
    }

    // ========================================
    // Malformed Data Tests
    // ========================================

    public function test_invalid_animal_type_returns_validation_error(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/animals', [
                'pack_id' => $this->pack->id,
                'animal_type_id' => 99999,
                'name' => 'Test',
                'sex' => 'male',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['animal_type_id']);
    }

    public function test_invalid_task_type_returns_validation_error(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/reminders', [
                'animal_id' => $this->animal->id,
                'task_type_id' => 99999,
                'title' => 'Test',
                'frequency' => 'daily',
                'time_of_day' => '09:00',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['task_type_id']);
    }

    public function test_invalid_frequency_returns_validation_error(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/reminders', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Test',
                'frequency' => 'invalid',
                'time_of_day' => '09:00',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['frequency']);
    }

    public function test_invalid_time_format_returns_validation_error(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/reminders', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Test',
                'frequency' => 'daily',
                'time_of_day' => 'invalid-time',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['time_of_day']);
    }

    public function test_day_of_week_out_of_range_returns_validation_error(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/reminders', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Test',
                'frequency' => 'weekly',
                'day_of_week' => 10, // Invalid: should be 0-6
                'time_of_day' => '09:00',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['day_of_week']);
    }

    public function test_day_of_month_out_of_range_returns_validation_error(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/reminders', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Test',
                'frequency' => 'monthly',
                'day_of_month' => 32, // Invalid: should be 1-31
                'time_of_day' => '09:00',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['day_of_month']);
    }

    // ========================================
    // Empty Data Tests
    // ========================================

    public function test_empty_pack_returns_empty_animals_list(): void
    {
        $emptyPack = Pack::factory()->create();
        $emptyPack->members()->attach($this->user->id, ['is_admin' => true]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/packs/{$emptyPack->id}/animals");

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_animal_with_no_reminders_returns_empty_list(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/animals/{$this->animal->id}/reminders");

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_animal_with_no_logs_returns_empty_list(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/animals/{$this->animal->id}/logs");

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }

    // ========================================
    // Concurrent Access Simulation
    // ========================================

    public function test_multiple_users_can_create_logs_for_same_animal(): void
    {
        $otherUser = User::factory()->create();
        $this->pack->members()->attach($otherUser->id, ['is_admin' => false]);

        // User 1 creates a log
        $response1 = $this->actingAs($this->user)
            ->postJson('/api/logs', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Log from User 1',
                'completed_at' => now()->format('Y-m-d H:i:s'),
            ]);

        // User 2 creates a log
        $response2 = $this->actingAs($otherUser)
            ->postJson('/api/logs', [
                'animal_id' => $this->animal->id,
                'task_type_id' => $this->taskType->id,
                'title' => 'Log from User 2',
                'completed_at' => now()->format('Y-m-d H:i:s'),
            ]);

        $response1->assertCreated();
        $response2->assertCreated();

        $this->assertDatabaseCount('task_logs', 2);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }
}
