<?php

namespace Database\Factories;

use App\Models\Animal;
use App\Models\AnimalType;
use App\Models\Pack;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnimalFactory extends Factory
{
    protected $model = Animal::class;

    public function definition(): array
    {
        return [
            'pack_id' => Pack::factory(),
            'animal_type_id' => AnimalType::first()?->id ?? 1,
            'name' => fake()->firstName(),
            'breed' => fake()->optional()->word(),
            'birth_date' => fake()->optional()->dateTimeBetween('-15 years', '-1 month'),
            'sex' => fake()->randomElement(['male', 'female', 'unknown']),
            'weight' => fake()->optional()->randomFloat(2, 0.1, 100),
            'chip_number' => fake()->optional()->numerify('###############'),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function dog(): static
    {
        return $this->state(fn (array $attributes) => [
            'animal_type_id' => AnimalType::where('key', 'dog')->first()?->id ?? 1,
        ]);
    }

    public function cat(): static
    {
        return $this->state(fn (array $attributes) => [
            'animal_type_id' => AnimalType::where('key', 'cat')->first()?->id ?? 2,
        ]);
    }

    public function male(): static
    {
        return $this->state(fn (array $attributes) => [
            'sex' => 'male',
        ]);
    }

    public function female(): static
    {
        return $this->state(fn (array $attributes) => [
            'sex' => 'female',
        ]);
    }
}
