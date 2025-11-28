<?php

namespace Database\Seeders;

use App\Models\AnimalType;
use App\Models\DefaultAnimalImage;
use Illuminate\Database\Seeder;

class DefaultAnimalImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $images = [
            'dog' => [
                'images/animals/dog/dog_default_1.webp',
                'images/animals/dog/dog_default_2.webp',
                'images/animals/dog/dog_default_3.webp',
                'images/animals/dog/dog_default_4.webp',
                'images/animals/dog/dog_default_5.webp',
            ],
            'cat' => [
                'images/animals/cat/cat_default_1.webp',
                'images/animals/cat/cat_default_2.webp',
                'images/animals/cat/cat_default_3.webp',
                'images/animals/cat/cat_default_4.webp',
                'images/animals/cat/cat_default_5.webp',
            ],
            'bird' => [
                'images/animals/bird/bird_default_1.webp',
                'images/animals/bird/bird_default_2.webp',
                'images/animals/bird/bird_default_3.webp',
                'images/animals/bird/bird_default_4.webp',
                'images/animals/bird/bird_default_5.webp',
            ],
            'fish' => [
                'images/animals/fish/fish_default_1.webp',
                'images/animals/fish/fish_default_2.webp',
                'images/animals/fish/fish_default_3.webp',
                'images/animals/fish/fish_default_4.webp',
                'images/animals/fish/fish_default_5.webp',
            ],
            'rabbit' => [
                'images/animals/rabbit/default_rabbit_1.webp',
                'images/animals/rabbit/default_rabbit_2.webp',
                'images/animals/rabbit/default_rabbit_3.webp',
                'images/animals/rabbit/default_rabbit_4.webp',
            ],
            'hamster' => [
                'images/animals/hamster/hamster.webp'
            ],
            'guinea_pig' => [
                'images/animals/guinea_pig/guinea_pig.webp'
            ],
            'turtle' => [
                'images/animals/turtle/default_turtle_1.webp',
                'images/animals/turtle/default_turtle_2.webp',
                'images/animals/turtle/default_turtle_3.webp',
            ],
            'snake' => [
                'images/animals/snake/default_snake_1.webp',
                'images/animals/snake/default_snake_2.webp',
                'images/animals/snake/default_snake_3.webp',
                'images/animals/snake/default_snake_4.webp',
            ],
            'lizard' => [
                'images/animals/lizard/default_lizard_1.webp',
                'images/animals/lizard/default_lizard_2.webp',
                'images/animals/lizard/default_lizard_3.webp',
                'images/animals/lizard/default_lizard_4.webp',
                'images/animals/lizard/default_lizard_5.webp',
            ],
            'ferret' => [
                'images/animals/ferret/default_ferret_1.webp',
                'images/animals/ferret/default_ferret_2.webp',
                'images/animals/ferret/default_ferret_3.webp',
            ],
            'horse' => [
                'images/animals/horse/default_horse_1.webp',
                'images/animals/horse/default_horse_2.webp',
                'images/animals/horse/default_horse_3.webp',
                'images/animals/horse/default_horse_4.webp',
                'images/animals/horse/default_horse_5.webp',
            ]
        ];

        foreach ($images as $typeKey => $imagePaths) {
            $type = AnimalType::where('key', $typeKey)->first();

            if (!$type) {
                continue;
            }

            foreach ($imagePaths as $path) {
                DefaultAnimalImage::firstOrCreate([
                    'animal_type_id' => $type->id,
                    'image_path' => $path,
                ]);
            }
        }
    }
}
