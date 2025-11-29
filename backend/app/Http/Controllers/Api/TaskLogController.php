<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TaskLog\StoreTaskLogRequest;
use App\Http\Requests\TaskLog\UpdateTaskLogRequest;
use App\Http\Resources\TaskLogResource;
use App\Models\Animal;
use App\Models\Reminder;
use App\Models\TaskLog;
use App\Repositories\TaskLogsRepository;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TaskLogController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected TaskLogsRepository $repository
    ) {}

    /**
     * List logs for an animal.
     */
    public function indexForAnimal(Request $request, Animal $animal): AnonymousResourceCollection
    {
        $this->authorize('viewAny', [TaskLog::class, $animal]);

        $logs = $this->repository->allForAnimal($animal, $request->input('per_page', 20));
        return TaskLogResource::collection($logs);
    }

    /**
     * List recent logs for an animal.
     */
    public function recentForAnimal(Request $request, Animal $animal): AnonymousResourceCollection
    {
        $this->authorize('viewAny', [TaskLog::class, $animal]);

        $logs = $this->repository->recentForAnimal($animal, $request->input('limit', 10));
        return TaskLogResource::collection($logs);
    }

    /**
     * List logs for a pack.
     */
    public function indexForPack(Request $request, int $packId): AnonymousResourceCollection
    {
        $logs = $this->repository->allForPack($packId, $request->input('per_page', 20));
        return TaskLogResource::collection($logs);
    }

    /**
     * List today's logs for current user.
     */
    public function today(Request $request): AnonymousResourceCollection
    {
        $logs = $this->repository->todayForUser($request->user());
        return TaskLogResource::collection($logs);
    }

    /**
     * Store a new task log.
     */
    public function store(StoreTaskLogRequest $request): TaskLogResource
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $data['completed_at'] = $data['completed_at'] ?? Carbon::now();

        $log = $this->repository->create($data);

        // Si viene de un recordatorio, avanzar al siguiente
        if (isset($data['reminder_id'])) {
            $reminder = Reminder::find($data['reminder_id']);
            if ($reminder) {
                $reminder->advanceToNextOccurrence();
            }
        }

        return new TaskLogResource($log);
    }

    /**
     * Show a task log.
     */
    public function show(TaskLog $taskLog): TaskLogResource
    {
        $this->authorize('view', $taskLog);

        $taskLog->load(['taskType', 'user', 'animal']);
        return new TaskLogResource($taskLog);
    }

    /**
     * Update a task log.
     */
    public function update(UpdateTaskLogRequest $request, TaskLog $taskLog): TaskLogResource
    {
        $log = $this->repository->update($taskLog, $request->validated());
        return new TaskLogResource($log);
    }

    /**
     * Delete a task log.
     */
    public function destroy(TaskLog $taskLog): JsonResponse
    {
        $this->authorize('delete', $taskLog);

        $this->repository->delete($taskLog);
        return response()->json(null, 204);
    }

    /**
     * Get statistics for an animal.
     */
    public function stats(Request $request, Animal $animal): JsonResponse
    {
        $this->authorize('viewAny', [TaskLog::class, $animal]);

        $days = $request->input('days', 30);
        $stats = $this->repository->getStatsForAnimal($animal, $days);

        return response()->json(['data' => $stats]);
    }
}
