<?php

namespace Database\Factories;

use App\Models\Animal;
use App\Models\Reminder;
use App\Models\TaskType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReminderFactory extends Factory
{
    protected $model = Reminder::class;

    public function definition(): array
    {
        $frequency = fake()->randomElement(['once', 'daily', 'weekly', 'monthly']);

        return [
            'animal_id' => Animal::factory(),
            'task_type_id' => TaskType::first()?->id ?? 1,
            'created_by' => User::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->sentence(),
            'frequency' => $frequency,
            'day_of_week' => $frequency === 'weekly' ? fake()->numberBetween(0, 6) : null,
            'day_of_month' => $frequency === 'monthly' ? fake()->numberBetween(1, 28) : null,
            'time_of_day' => fake()->time('H:i'),
            'specific_date' => $frequency === 'once' ? fake()->dateTimeBetween('now', '+1 year') : null,
            'is_active' => true,
            'next_occurrence' => fake()->dateTimeBetween('now', '+1 week'),
        ];
    }

    public function daily(): static
    {
        return $this->state(fn (array $attributes) => [
            'frequency' => 'daily',
            'day_of_week' => null,
            'day_of_month' => null,
            'specific_date' => null,
        ]);
    }

    public function weekly(): static
    {
        return $this->state(fn (array $attributes) => [
            'frequency' => 'weekly',
            'day_of_week' => fake()->numberBetween(0, 6),
            'day_of_month' => null,
            'specific_date' => null,
        ]);
    }

    public function monthly(): static
    {
        return $this->state(fn (array $attributes) => [
            'frequency' => 'monthly',
            'day_of_week' => null,
            'day_of_month' => fake()->numberBetween(1, 28),
            'specific_date' => null,
        ]);
    }

    public function once(): static
    {
        return $this->state(fn (array $attributes) => [
            'frequency' => 'once',
            'day_of_week' => null,
            'day_of_month' => null,
            'specific_date' => fake()->dateTimeBetween('now', '+1 year'),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
