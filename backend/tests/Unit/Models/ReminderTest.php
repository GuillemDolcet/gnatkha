<?php

namespace Tests\Unit\Models;

use App\Models\Animal;
use App\Models\Pack;
use App\Models\Reminder;
use App\Models\TaskType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReminderTest extends TestCase
{
    use RefreshDatabase;

    private Reminder $reminder;
    private Animal $animal;
    private User $user;
    private TaskType $taskType;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\AnimalTypeSeeder::class);
        $this->seed(\Database\Seeders\TaskTypeSeeder::class);

        $this->user = User::factory()->create();
        $pack = Pack::factory()->create();
        $pack->members()->attach($this->user->id, ['is_admin' => true]);
        $this->animal = Animal::factory()->create(['pack_id' => $pack->id]);
        $this->taskType = TaskType::first();
    }

    // ========================================
    // Daily Reminder Tests
    // ========================================

    public function test_daily_reminder_calculates_next_occurrence_today_if_time_not_passed(): void
    {
        Carbon::setTestNow(Carbon::today()->setTime(8, 0));

        $reminder = Reminder::create([
            'animal_id' => $this->animal->id,
            'task_type_id' => $this->taskType->id,
            'created_by' => $this->user->id,
            'title' => 'Daily Task',
            'frequency' => 'daily',
            'time_of_day' => '09:00',
            'is_active' => true,
        ]);

        $reminder->calculateNextOccurrence();

        $expected = Carbon::today()->setTime(9, 0);
        $this->assertEquals($expected->format('Y-m-d H:i'), $reminder->next_occurrence->format('Y-m-d H:i'));
    }

    public function test_daily_reminder_calculates_next_occurrence_tomorrow_if_time_passed(): void
    {
        Carbon::setTestNow(Carbon::today()->setTime(10, 0));

        $reminder = Reminder::create([
            'animal_id' => $this->animal->id,
            'task_type_id' => $this->taskType->id,
            'created_by' => $this->user->id,
            'title' => 'Daily Task',
            'frequency' => 'daily',
            'time_of_day' => '09:00',
            'is_active' => true,
        ]);

        $reminder->calculateNextOccurrence();

        $expected = Carbon::tomorrow()->setTime(9, 0);
        $this->assertEquals($expected->format('Y-m-d H:i'), $reminder->next_occurrence->format('Y-m-d H:i'));
    }

    // ========================================
    // Weekly Reminder Tests
    // ========================================

    public function test_weekly_reminder_calculates_next_occurrence_this_week(): void
    {
        // Set to Monday 8:00
        Carbon::setTestNow(Carbon::parse('Monday')->setTime(8, 0));

        $reminder = Reminder::create([
            'animal_id' => $this->animal->id,
            'task_type_id' => $this->taskType->id,
            'created_by' => $this->user->id,
            'title' => 'Weekly Task',
            'frequency' => 'weekly',
            'day_of_week' => 3, // Wednesday
            'time_of_day' => '10:00',
            'is_active' => true,
        ]);

        $reminder->calculateNextOccurrence();

        $this->assertEquals(3, $reminder->next_occurrence->dayOfWeek); // Wednesday
        $this->assertEquals('10:00', $reminder->next_occurrence->format('H:i'));
    }

    public function test_weekly_reminder_calculates_next_week_if_day_passed(): void
    {
        // Set to Thursday 8:00
        Carbon::setTestNow(Carbon::parse('Thursday')->setTime(8, 0));

        $reminder = Reminder::create([
            'animal_id' => $this->animal->id,
            'task_type_id' => $this->taskType->id,
            'created_by' => $this->user->id,
            'title' => 'Weekly Task',
            'frequency' => 'weekly',
            'day_of_week' => 1, // Monday
            'time_of_day' => '10:00',
            'is_active' => true,
        ]);

        $reminder->calculateNextOccurrence();

        $this->assertEquals(1, $reminder->next_occurrence->dayOfWeek); // Monday
        $this->assertTrue($reminder->next_occurrence->isAfter(Carbon::now()));
    }

    public function test_weekly_reminder_same_day_but_time_passed_goes_to_next_week(): void
    {
        // Set to Wednesday 12:00
        Carbon::setTestNow(Carbon::parse('Wednesday')->setTime(12, 0));

        $reminder = Reminder::create([
            'animal_id' => $this->animal->id,
            'task_type_id' => $this->taskType->id,
            'created_by' => $this->user->id,
            'title' => 'Weekly Task',
            'frequency' => 'weekly',
            'day_of_week' => 3, // Wednesday
            'time_of_day' => '10:00',
            'is_active' => true,
        ]);

        $reminder->calculateNextOccurrence();

        $this->assertEquals(3, $reminder->next_occurrence->dayOfWeek);
        $this->assertTrue($reminder->next_occurrence->isAfter(Carbon::now()));
    }

    // ========================================
    // Monthly Reminder Tests
    // ========================================

    public function test_monthly_reminder_calculates_next_occurrence_this_month(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 1, 10, 8, 0));

        $reminder = Reminder::create([
            'animal_id' => $this->animal->id,
            'task_type_id' => $this->taskType->id,
            'created_by' => $this->user->id,
            'title' => 'Monthly Task',
            'frequency' => 'monthly',
            'day_of_month' => 15,
            'time_of_day' => '09:00',
            'is_active' => true,
        ]);

        $reminder->calculateNextOccurrence();

        $this->assertEquals(15, $reminder->next_occurrence->day);
        $this->assertEquals(1, $reminder->next_occurrence->month);
    }

    public function test_monthly_reminder_calculates_next_month_if_day_passed(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 1, 20, 8, 0));

        $reminder = Reminder::create([
            'animal_id' => $this->animal->id,
            'task_type_id' => $this->taskType->id,
            'created_by' => $this->user->id,
            'title' => 'Monthly Task',
            'frequency' => 'monthly',
            'day_of_month' => 15,
            'time_of_day' => '09:00',
            'is_active' => true,
        ]);

        $reminder->calculateNextOccurrence();

        $this->assertEquals(15, $reminder->next_occurrence->day);
        $this->assertEquals(2, $reminder->next_occurrence->month);
    }

    public function test_monthly_reminder_handles_short_months(): void
    {
        // February only has 28 days (non-leap year)
        Carbon::setTestNow(Carbon::create(2025, 2, 1, 8, 0));

        $reminder = Reminder::create([
            'animal_id' => $this->animal->id,
            'task_type_id' => $this->taskType->id,
            'created_by' => $this->user->id,
            'title' => 'Monthly Task',
            'frequency' => 'monthly',
            'day_of_month' => 31, // No existe en febrero
            'time_of_day' => '09:00',
            'is_active' => true,
        ]);

        $reminder->calculateNextOccurrence();

        // Should use last day of month
        $this->assertEquals(28, $reminder->next_occurrence->day);
        $this->assertEquals(2, $reminder->next_occurrence->month);
    }

    // ========================================
    // One-time Reminder Tests
    // ========================================

    public function test_once_reminder_sets_specific_date(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 1, 10, 8, 0));

        $reminder = Reminder::create([
            'animal_id' => $this->animal->id,
            'task_type_id' => $this->taskType->id,
            'created_by' => $this->user->id,
            'title' => 'One-time Task',
            'frequency' => 'once',
            'specific_date' => '2025-01-20',
            'time_of_day' => '14:00',
            'is_active' => true,
        ]);

        $reminder->calculateNextOccurrence();

        $this->assertEquals('2025-01-20', $reminder->next_occurrence->format('Y-m-d'));
        $this->assertEquals('14:00', $reminder->next_occurrence->format('H:i'));
    }

    public function test_once_reminder_past_date_sets_null(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 1, 25, 8, 0));

        $reminder = Reminder::create([
            'animal_id' => $this->animal->id,
            'task_type_id' => $this->taskType->id,
            'created_by' => $this->user->id,
            'title' => 'One-time Task',
            'frequency' => 'once',
            'specific_date' => '2025-01-20',
            'time_of_day' => '14:00',
            'is_active' => true,
        ]);

        $reminder->calculateNextOccurrence();

        $this->assertNull($reminder->next_occurrence);
    }

    // ========================================
    // Advance to Next Occurrence Tests
    // ========================================

    public function test_advance_to_next_occurrence_for_daily(): void
    {
        Carbon::setTestNow(Carbon::today()->setTime(9, 30));

        $reminder = Reminder::create([
            'animal_id' => $this->animal->id,
            'task_type_id' => $this->taskType->id,
            'created_by' => $this->user->id,
            'title' => 'Daily Task',
            'frequency' => 'daily',
            'time_of_day' => '09:00',
            'is_active' => true,
            'next_occurrence' => Carbon::today()->setTime(9, 0),
        ]);

        $reminder->advanceToNextOccurrence();

        $expected = Carbon::tomorrow()->setTime(9, 0);
        $this->assertEquals($expected->format('Y-m-d H:i'), $reminder->next_occurrence->format('Y-m-d H:i'));
        $this->assertTrue($reminder->is_active);
    }

    public function test_advance_to_next_occurrence_for_once_deactivates(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 1, 20, 15, 0));

        $reminder = Reminder::create([
            'animal_id' => $this->animal->id,
            'task_type_id' => $this->taskType->id,
            'created_by' => $this->user->id,
            'title' => 'One-time Task',
            'frequency' => 'once',
            'specific_date' => '2025-01-20',
            'time_of_day' => '14:00',
            'is_active' => true,
            'next_occurrence' => Carbon::create(2025, 1, 20, 14, 0),
        ]);

        $reminder->advanceToNextOccurrence();

        $this->assertFalse($reminder->is_active);
        $this->assertNull($reminder->next_occurrence);
    }

    // ========================================
    // Relationship Tests
    // ========================================

    public function test_reminder_belongs_to_animal(): void
    {
        $reminder = Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
        ]);

        $this->assertInstanceOf(Animal::class, $reminder->animal);
        $this->assertEquals($this->animal->id, $reminder->animal->id);
    }

    public function test_reminder_belongs_to_task_type(): void
    {
        $reminder = Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'task_type_id' => $this->taskType->id,
        ]);

        $this->assertInstanceOf(TaskType::class, $reminder->taskType);
        $this->assertEquals($this->taskType->id, $reminder->taskType->id);
    }

    public function test_reminder_belongs_to_creator(): void
    {
        $reminder = Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
        ]);

        $this->assertInstanceOf(User::class, $reminder->creator);
        $this->assertEquals($this->user->id, $reminder->creator->id);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow(); // Reset time
        parent::tearDown();
    }
}
