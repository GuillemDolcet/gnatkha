<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reminder\StoreReminderRequest;
use App\Http\Requests\Reminder\UpdateReminderRequest;
use App\Http\Resources\ReminderResource;
use App\Models\Animal;
use App\Models\Reminder;
use App\Repositories\RemindersRepository;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReminderController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected RemindersRepository $repository
    ) {}

    /**
     * List reminders for an animal.
     */
    public function indexForAnimal(Request $request, Animal $animal): AnonymousResourceCollection
    {
        $this->authorize('viewAny', [Reminder::class, $animal]);

        $reminders = $this->repository->allForAnimal($animal);
        return ReminderResource::collection($reminders);
    }

    /**
     * List reminders for a pack.
     */
    public function indexForPack(Request $request, int $packId): AnonymousResourceCollection
    {
        $reminders = $this->repository->allForPack($packId);
        return ReminderResource::collection($reminders);
    }

    /**
     * List upcoming reminders for current user.
     */
    public function upcoming(Request $request): AnonymousResourceCollection
    {
        $days = $request->input('days', 7);
        $reminders = $this->repository->upcomingForUser($request->user(), $days);
        return ReminderResource::collection($reminders);
    }

    /**
     * Store a new reminder.
     */
    public function store(StoreReminderRequest $request): ReminderResource
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->id;

        $reminder = $this->repository->create($data);
        return new ReminderResource($reminder);
    }

    /**
     * Show a reminder.
     */
    public function show(Reminder $reminder): ReminderResource
    {
        $this->authorize('view', $reminder);

        $reminder->load(['taskType', 'creator', 'animal']);
        return new ReminderResource($reminder);
    }

    /**
     * Update a reminder.
     */
    public function update(UpdateReminderRequest $request, Reminder $reminder): ReminderResource
    {
        $reminder = $this->repository->update($reminder, $request->validated());
        return new ReminderResource($reminder);
    }

    /**
     * Delete a reminder.
     */
    public function destroy(Reminder $reminder): JsonResponse
    {
        $this->authorize('delete', $reminder);

        $this->repository->delete($reminder);
        return response()->json(null, 204);
    }

    /**
     * Toggle reminder active status.
     */
    public function toggle(Reminder $reminder): ReminderResource
    {
        $this->authorize('update', $reminder);

        $reminder = $this->repository->toggleActive($reminder);
        return new ReminderResource($reminder);
    }
}
