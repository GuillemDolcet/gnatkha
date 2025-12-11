<?php

namespace Database\Factories;

use App\Models\Animal;
use App\Models\Reminder;
use App\Models\TaskLog;
use App\Models\TaskType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskLogFactory extends Factory
{
    protected $model = TaskLog::class;

    public function definition(): array
    {
        return [
            'animal_id' => Animal::factory(),
            'task_type_id' => TaskType::first()?->id ?? 1,
            'user_id' => User::factory(),
            'reminder_id' => null,
            'title' => fake()->sentence(3),
            'notes' => fake()->optional()->sentence(),
            'completed_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ];
    }

    public function fromReminder(Reminder $reminder): static
    {
        return $this->state(fn (array $attributes) => [
            'animal_id' => $reminder->animal_id,
            'task_type_id' => $reminder->task_type_id,
            'reminder_id' => $reminder->id,
            'title' => $reminder->title,
        ]);
    }

    public function today(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed_at' => fake()->dateTimeBetween('today', 'now'),
        ]);
    }

    public function yesterday(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed_at' => fake()->dateTimeBetween('yesterday', 'yesterday 23:59:59'),
        ]);
    }
}
