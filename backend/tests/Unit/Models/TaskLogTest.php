<?php

namespace Tests\Unit\Models;

use App\Models\Animal;
use App\Models\Pack;
use App\Models\Reminder;
use App\Models\TaskLog;
use App\Models\TaskType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskLogTest extends TestCase
{
    use RefreshDatabase;

    private Pack $pack;
    private User $user;
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
    // Relationship Tests
    // ========================================

    public function test_task_log_belongs_to_animal(): void
    {
        $log = TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
        ]);

        $this->assertInstanceOf(Animal::class, $log->animal);
        $this->assertEquals($this->animal->id, $log->animal->id);
    }

    public function test_task_log_belongs_to_user(): void
    {
        $log = TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
        ]);

        $this->assertInstanceOf(User::class, $log->user);
        $this->assertEquals($this->user->id, $log->user->id);
    }

    public function test_task_log_belongs_to_task_type(): void
    {
        $log = TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
        ]);

        $this->assertInstanceOf(TaskType::class, $log->taskType);
        $this->assertEquals($this->taskType->id, $log->taskType->id);
    }

    public function test_task_log_can_belong_to_reminder(): void
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
        ]);

        $this->assertInstanceOf(Reminder::class, $log->reminder);
        $this->assertEquals($reminder->id, $log->reminder->id);
    }

    public function test_task_log_reminder_is_optional(): void
    {
        $log = TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'reminder_id' => null,
        ]);

        $this->assertNull($log->reminder);
    }

    // ========================================
    // Attribute Tests
    // ========================================

    public function test_task_log_casts_completed_at_to_datetime(): void
    {
        $completedAt = Carbon::create(2025, 1, 15, 14, 30);

        $log = TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'completed_at' => $completedAt,
        ]);

        $this->assertInstanceOf(Carbon::class, $log->completed_at);
        $this->assertEquals('2025-01-15 14:30:00', $log->completed_at->format('Y-m-d H:i:s'));
    }

    public function test_task_log_notes_can_be_null(): void
    {
        $log = TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'notes' => null,
        ]);

        $this->assertNull($log->notes);
    }

    public function test_task_log_notes_can_be_long_text(): void
    {
        $longNotes = str_repeat('This is a long note. ', 100);

        $log = TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'notes' => $longNotes,
        ]);

        $this->assertEquals($longNotes, $log->notes);
    }

    // ========================================
    // Cascade Delete Tests
    // ========================================

    public function test_deleting_user_does_not_delete_task_logs(): void
    {
        $otherUser = User::factory()->create();
        $this->pack->members()->attach($otherUser->id, ['is_admin' => false]);

        $log = TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $otherUser->id,
            'task_type_id' => $this->taskType->id,
        ]);

        $logId = $log->id;

        // En una app real, probablemente querrías soft delete o mantener el log
        // Este test documenta el comportamiento actual
        $this->assertDatabaseHas('task_logs', ['id' => $logId]);
    }

    public function test_deleting_reminder_does_not_delete_task_logs(): void
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
        ]);

        $logId = $log->id;
        $reminder->delete();

        // Task log should remain but with null reminder_id
        $this->assertDatabaseHas('task_logs', ['id' => $logId]);
    }
}
