<?php

namespace Tests\Unit;

use App\Models\Animal;
use App\Models\Pack;
use App\Models\Reminder;
use App\Models\TaskLog;
use App\Models\TaskType;
use App\Models\User;
use App\Repositories\RemindersRepository;
use App\Repositories\TaskLogsRepository;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RepositoryTest extends TestCase
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
    // Reminders Repository Tests
    // ========================================

    public function test_reminders_repository_get_upcoming_only_returns_active(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 1, 15, 8, 0));

        $repository = app(RemindersRepository::class);

        // Active reminder
        Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'is_active' => true,
            'next_occurrence' => Carbon::create(2025, 1, 16, 9, 0),
        ]);

        // Inactive reminder
        Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'is_active' => false,
            'next_occurrence' => Carbon::create(2025, 1, 16, 9, 0),
        ]);

        $upcoming = $repository->upcomingForUser($this->user, 7);

        $this->assertCount(1, $upcoming);
    }

    public function test_reminders_repository_get_upcoming_respects_days_limit(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 1, 15, 8, 0));

        $repository = app(RemindersRepository::class);

        // Within 3 days
        Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'is_active' => true,
            'next_occurrence' => Carbon::create(2025, 1, 17, 9, 0),
        ]);

        // Beyond 3 days
        Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'is_active' => true,
            'next_occurrence' => Carbon::create(2025, 1, 25, 9, 0),
        ]);

        $upcoming = $repository->upcomingForUser($this->user, 3);

        $this->assertCount(1, $upcoming);
    }

    public function test_reminders_repository_toggle_switches_state(): void
    {
        $repository = app(RemindersRepository::class);

        $reminder = Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'is_active' => true,
        ]);

        $result = $repository->toggleActive($reminder);
        $this->assertFalse($result->is_active);

        $result = $repository->toggleActive($reminder);
        $this->assertTrue($result->is_active);
    }

    // ========================================
    // Task Logs Repository Tests
    // ========================================

    public function test_task_logs_repository_today_returns_only_todays_logs(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 1, 15, 14, 0));

        $repository = app(TaskLogsRepository::class);

        // Today's log
        TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'completed_at' => Carbon::create(2025, 1, 15, 10, 0),
        ]);

        // Yesterday's log
        TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'completed_at' => Carbon::create(2025, 1, 14, 10, 0),
        ]);

        $todayLogs = $repository->todayForUser($this->user);

        $this->assertCount(1, $todayLogs);
    }

    public function test_task_logs_repository_recent_respects_limit(): void
    {
        $repository = app(TaskLogsRepository::class);

        TaskLog::factory()->count(10)->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'completed_at' => now(),
        ]);

        $recentLogs = $repository->recentForAnimal($this->animal, 5);

        $this->assertCount(5, $recentLogs);
    }

    public function test_task_logs_repository_orders_by_completed_at_desc(): void
    {
        $repository = app(TaskLogsRepository::class);

        $older = TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'completed_at' => now()->subHours(2),
            'title' => 'Older',
        ]);

        $newer = TaskLog::factory()->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'completed_at' => now(),
            'title' => 'Newer',
        ]);

        $logs = $repository->recentForAnimal($this->animal, 10);

        $this->assertEquals('Newer', $logs->first()->title);
        $this->assertEquals('Older', $logs->last()->title);
    }

    public function test_task_logs_repository_stats_groups_by_task_type(): void
    {
        $repository = app(TaskLogsRepository::class);

        $taskType1 = TaskType::where('key', 'feed')->first();
        $taskType2 = TaskType::where('key', 'walk')->first();

        // 3 feed logs
        TaskLog::factory()->count(3)->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $taskType1->id,
            'completed_at' => now(),
        ]);

        // 2 walk logs
        TaskLog::factory()->count(2)->create([
            'animal_id' => $this->animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $taskType2->id,
            'completed_at' => now(),
        ]);

        $stats = $repository->getStatsForAnimal($this->animal, 30);

        $this->assertEquals(3, $stats['feed']);
        $this->assertEquals(2, $stats['walk']);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }
}
