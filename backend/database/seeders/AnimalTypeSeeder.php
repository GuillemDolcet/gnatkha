<?php

namespace Database\Seeders;

use App\Models\AnimalType;
use Illuminate\Database\Seeder;

class AnimalTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            'dog',
            'cat',
            'bird',
            'fish',
            'rabbit',
            'hamster',
            'guinea_pig',
            'turtle',
            'snake',
            'lizard',
            'ferret',
            'horse',
            'other',
        ];

        foreach ($types as $type) {
            AnimalType::firstOrCreate(['key' => $type]);
        }
    }
}
