<?php

namespace Tests\Unit\Models;

use App\Models\Animal;
use App\Models\Pack;
use App\Models\Reminder;
use App\Models\TaskLog;
use App\Models\TaskType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnimalTest extends TestCase
{
    use RefreshDatabase;

    private Pack $pack;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\AnimalTypeSeeder::class);
        $this->seed(\Database\Seeders\TaskTypeSeeder::class);

        $this->user = User::factory()->create();
        $this->pack = Pack::factory()->create();
        $this->pack->members()->attach($this->user->id, ['is_admin' => true]);
    }

    // ========================================
    // Relationship Tests
    // ========================================

    public function test_animal_belongs_to_pack(): void
    {
        $animal = Animal::factory()->create(['pack_id' => $this->pack->id]);

        $this->assertInstanceOf(Pack::class, $animal->pack);
        $this->assertEquals($this->pack->id, $animal->pack->id);
    }

    public function test_animal_has_many_reminders(): void
    {
        $animal = Animal::factory()->create(['pack_id' => $this->pack->id]);

        Reminder::factory()->count(3)->create([
            'animal_id' => $animal->id,
            'created_by' => $this->user->id,
        ]);

        $this->assertCount(3, $animal->reminders);
        $this->assertInstanceOf(Reminder::class, $animal->reminders->first());
    }

    public function test_animal_has_many_task_logs(): void
    {
        $animal = Animal::factory()->create(['pack_id' => $this->pack->id]);
        $taskType = TaskType::first();

        TaskLog::factory()->count(5)->create([
            'animal_id' => $animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $taskType->id,
        ]);

        $this->assertCount(5, $animal->taskLogs);
        $this->assertInstanceOf(TaskLog::class, $animal->taskLogs->first());
    }

    // ========================================
    // Cascade Delete Tests
    // ========================================

    public function test_deleting_animal_deletes_reminders(): void
    {
        $animal = Animal::factory()->create(['pack_id' => $this->pack->id]);

        $reminder = Reminder::factory()->create([
            'animal_id' => $animal->id,
            'created_by' => $this->user->id,
        ]);

        $reminderId = $reminder->id;
        $animal->delete();

        $this->assertDatabaseMissing('reminders', ['id' => $reminderId]);
    }

    public function test_deleting_animal_deletes_task_logs(): void
    {
        $animal = Animal::factory()->create(['pack_id' => $this->pack->id]);
        $taskType = TaskType::first();

        $log = TaskLog::factory()->create([
            'animal_id' => $animal->id,
            'user_id' => $this->user->id,
            'task_type_id' => $taskType->id,
        ]);

        $logId = $log->id;
        $animal->delete();

        $this->assertDatabaseMissing('task_logs', ['id' => $logId]);
    }

    // ========================================
    // Attribute Tests
    // ========================================

    public function test_animal_casts_birth_date_to_date(): void
    {
        $animal = Animal::factory()->create([
            'pack_id' => $this->pack->id,
            'birth_date' => '2020-05-15',
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $animal->birth_date);
        $this->assertEquals('2020-05-15', $animal->birth_date->format('Y-m-d'));
    }

    public function test_animal_weight_can_be_decimal(): void
    {
        $animal = Animal::factory()->create([
            'pack_id' => $this->pack->id,
            'weight' => 25.75,
        ]);

        $this->assertEquals(25.75, $animal->weight);
    }

    public function test_animal_sex_must_be_valid_enum(): void
    {
        $animal = Animal::factory()->create([
            'pack_id' => $this->pack->id,
            'sex' => 'male',
        ]);

        $this->assertEquals('male', $animal->sex);

        $animal->sex = 'female';
        $animal->save();
        $this->assertEquals('female', $animal->sex);

        $animal->sex = 'unknown';
        $animal->save();
        $this->assertEquals('unknown', $animal->sex);
    }

    // ========================================
    // Image Tests
    // ========================================

    public function test_animal_image_url_returns_null_when_no_image(): void
    {
        $animal = Animal::factory()->create([
            'pack_id' => $this->pack->id,
            'image_path' => null,
        ]);

        // image_url is computed in the resource, but image_path should be null
        $this->assertNull($animal->image_path);
    }

    public function test_animal_can_have_default_image(): void
    {
        // default_image_id requires the image to exist in default_animal_images table
        // Testing that the field exists and can be set (when null)
        $animal = Animal::factory()->create([
            'pack_id' => $this->pack->id,
            'default_image_id' => null,
        ]);

        $this->assertNull($animal->default_image_id);
    }
}
