<?php

namespace Tests\Feature\Task;

use App\Models\Animal;
use App\Models\Pack;
use App\Models\Reminder;
use App\Models\TaskType;
use App\Models\User;
use App\Repositories\RemindersRepository;
use App\Services\Push\WebPushService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

class ProcessRemindersTest extends TestCase
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

    private function mockWebPushService(): void
    {
        $this->mock(WebPushService::class, function (MockInterface $mock) {
            $mock->shouldReceive('sendReminderNotification')
                ->andReturn(['success' => 1, 'failed' => 0, 'expired' => []]);
        });
    }

    public function test_command_processes_due_reminders(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 1, 15, 10, 0));
        $this->mockWebPushService();

        $reminder = Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'frequency' => 'daily',
            'time_of_day' => '09:00',
            'is_active' => true,
            'next_occurrence' => Carbon::create(2025, 1, 15, 9, 0),
        ]);

        $this->artisan('reminders:process')
            ->assertExitCode(0);

        $reminder->refresh();
        $this->assertEquals(
            Carbon::create(2025, 1, 16, 9, 0)->format('Y-m-d H:i'),
            $reminder->next_occurrence->format('Y-m-d H:i')
        );
    }

    public function test_command_skips_inactive_reminders(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 1, 15, 10, 0));
        $this->mockWebPushService();

        Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'frequency' => 'daily',
            'time_of_day' => '09:00',
            'is_active' => false,
            'next_occurrence' => Carbon::create(2025, 1, 15, 9, 0),
        ]);

        $this->artisan('reminders:process')
            ->expectsOutputToContain('Found 0 due reminders')
            ->assertExitCode(0);
    }

    public function test_command_skips_future_reminders(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 1, 15, 10, 0));
        $this->mockWebPushService();

        Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'frequency' => 'daily',
            'time_of_day' => '14:00',
            'is_active' => true,
            'next_occurrence' => Carbon::create(2025, 1, 15, 14, 0),
        ]);

        $this->artisan('reminders:process')
            ->expectsOutputToContain('Found 0 due reminders')
            ->assertExitCode(0);
    }

    public function test_command_processes_multiple_reminders(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 1, 15, 10, 0));
        $this->mockWebPushService();

        Reminder::factory()->count(3)->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'frequency' => 'daily',
            'time_of_day' => '09:00',
            'is_active' => true,
            'next_occurrence' => Carbon::create(2025, 1, 15, 9, 0),
        ]);

        $this->artisan('reminders:process')
            ->expectsOutputToContain('Found 3 due reminders')
            ->assertExitCode(0);
    }

    public function test_command_handles_one_time_reminders(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 1, 15, 10, 0));
        $this->mockWebPushService();

        $reminder = Reminder::factory()->create([
            'animal_id' => $this->animal->id,
            'created_by' => $this->user->id,
            'task_type_id' => $this->taskType->id,
            'frequency' => 'once',
            'specific_date' => '2025-01-15',
            'time_of_day' => '09:00',
            'is_active' => true,
            'next_occurrence' => Carbon::create(2025, 1, 15, 9, 0),
        ]);

        $this->artisan('reminders:process')
            ->assertExitCode(0);

        $reminder->refresh();
        $this->assertFalse($reminder->is_active);
        $this->assertNull($reminder->next_occurrence);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        Mockery::close();
        parent::tearDown();
    }
}
