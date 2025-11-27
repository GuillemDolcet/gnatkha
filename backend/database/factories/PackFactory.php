<?php

namespace Database\Factories;

use App\Models\Pack;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Pack>
 */
class PackFactory extends Factory
{
    protected $model = Pack::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'invitation_code' => strtoupper(Str::random(8)),
        ];
    }
}
