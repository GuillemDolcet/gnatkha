<?php

namespace App\Repositories;

use App\Models\Animal;
use App\Models\TaskLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class TaskLogsRepository
{
    /**
     * Get all logs for an animal.
     */
    public function allForAnimal(Animal $animal, int $perPage = 20): LengthAwarePaginator
    {
        return $animal->taskLogs()
            ->with(['taskType', 'user'])
            ->orderBy('completed_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get logs for an animal filtered by task type.
     */
    public function forAnimalByType(Animal $animal, int $taskTypeId, int $perPage = 20): LengthAwarePaginator
    {
        return $animal->taskLogs()
            ->where('task_type_id', $taskTypeId)
            ->with(['taskType', 'user'])
            ->orderBy('completed_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get recent logs for an animal.
     */
    public function recentForAnimal(Animal $animal, int $limit = 10): Collection
    {
        return $animal->taskLogs()
            ->with(['taskType', 'user'])
            ->orderBy('completed_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get logs for a pack (all animals).
     */
    public function allForPack(int $packId, int $perPage = 20): LengthAwarePaginator
    {
        return TaskLog::whereHas('animal', function ($query) use ($packId) {
            $query->where('pack_id', $packId);
        })
            ->with(['animal', 'taskType', 'user'])
            ->orderBy('completed_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get logs for today for a user (from all their packs).
     */
    public function todayForUser(User $user): Collection
    {
        $packIds = $user->packs()->pluck('packs.id');

        return TaskLog::whereHas('animal', function ($query) use ($packIds) {
            $query->whereIn('pack_id', $packIds);
        })
            ->whereDate('completed_at', Carbon::today())
            ->with(['animal', 'taskType', 'user'])
            ->orderBy('completed_at', 'desc')
            ->get();
    }

    /**
     * Create a new task log.
     */
    public function create(array $data): TaskLog
    {
        $log = TaskLog::create($data);
        return $log->load(['taskType', 'user', 'animal']);
    }

    /**
     * Update a task log.
     */
    public function update(TaskLog $log, array $data): TaskLog
    {
        $log->update($data);
        return $log->load(['taskType', 'user', 'animal']);
    }

    /**
     * Delete a task log.
     */
    public function delete(TaskLog $log): bool
    {
        return $log->delete();
    }

    /**
     * Get statistics for an animal.
     */
    public function getStatsForAnimal(Animal $animal, int $days = 30): array
    {
        $since = Carbon::now()->subDays($days);

        $logs = $animal->taskLogs()
            ->where('completed_at', '>=', $since)
            ->selectRaw('task_type_id, COUNT(*) as count')
            ->groupBy('task_type_id')
            ->with('taskType')
            ->get();

        return $logs->mapWithKeys(function ($log) {
            return [$log->taskType->key => $log->count];
        })->toArray();
    }
}
