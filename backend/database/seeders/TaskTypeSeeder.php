<?php

namespace Database\Seeders;

use App\Models\TaskType;
use Illuminate\Database\Seeder;

class TaskTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            ['key' => 'feed', 'icon' => 'bowl', 'color' => '#F59E0B'],
            ['key' => 'walk', 'icon' => 'walk', 'color' => '#10B981'],
            ['key' => 'vet', 'icon' => 'stethoscope', 'color' => '#EF4444'],
            ['key' => 'vaccine', 'icon' => 'vaccine', 'color' => '#8B5CF6'],
            ['key' => 'medication', 'icon' => 'pill', 'color' => '#EC4899'],
            ['key' => 'grooming', 'icon' => 'scissors', 'color' => '#06B6D4'],
            ['key' => 'training', 'icon' => 'target', 'color' => '#F97316'],
            ['key' => 'play', 'icon' => 'ball', 'color' => '#84CC16'],
            ['key' => 'bath', 'icon' => 'droplet', 'color' => '#3B82F6'],
            ['key' => 'weight', 'icon' => 'scale', 'color' => '#6366F1'],
            ['key' => 'other', 'icon' => 'dots', 'color' => '#6B7280'],
        ];

        foreach ($types as $type) {
            TaskType::firstOrCreate(
                ['key' => $type['key']],
                $type
            );
        }
    }
}
