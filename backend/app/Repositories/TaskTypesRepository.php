<?php

namespace App\Repositories;

use App\Models\TaskType;
use Illuminate\Database\Eloquent\Collection;

class TaskTypesRepository
{
    /**
     * Get all task types.
     */
    public function all(): Collection
    {
        return TaskType::all();
    }

    /**
     * Find a task type by key.
     */
    public function findByKey(string $key): ?TaskType
    {
        return TaskType::where('key', $key)->first();
    }
}
