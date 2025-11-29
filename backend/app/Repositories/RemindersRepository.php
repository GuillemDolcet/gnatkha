<?php

namespace App\Repositories;

use App\Models\Animal;
use App\Models\Reminder;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class RemindersRepository
{
    /**
     * Get all reminders for an animal.
     */
    public function allForAnimal(Animal $animal): Collection
    {
        return $animal->reminders()
            ->with(['taskType', 'creator'])
            ->orderBy('next_occurrence')
            ->get();
    }

    /**
     * Get active reminders for an animal.
     */
    public function activeForAnimal(Animal $animal): Collection
    {
        return $animal->reminders()
            ->where('is_active', true)
            ->with(['taskType', 'creator'])
            ->orderBy('next_occurrence')
            ->get();
    }

    /**
     * Get all reminders for a pack (all animals in the pack).
     */
    public function allForPack(int $packId): Collection
    {
        return Reminder::whereHas('animal', function ($query) use ($packId) {
            $query->where('pack_id', $packId);
        })
            ->with(['animal', 'taskType', 'creator'])
            ->where('is_active', true)
            ->orderBy('next_occurrence')
            ->get();
    }

    /**
     * Get reminders due for notification.
     */
    public function getDueReminders(): Collection
    {
        return Reminder::where('is_active', true)
            ->where('next_occurrence', '<=', Carbon::now())
            ->with(['animal.pack', 'taskType', 'creator'])
            ->get();
    }

    /**
     * Get upcoming reminders for a user (from all their packs).
     */
    public function upcomingForUser(User $user, int $days = 7): Collection
    {
        $packIds = $user->packs()->pluck('packs.id');

        return Reminder::whereHas('animal', function ($query) use ($packIds) {
            $query->whereIn('pack_id', $packIds);
        })
            ->where('is_active', true)
            ->where('next_occurrence', '<=', Carbon::now()->addDays($days))
            ->with(['animal', 'taskType'])
            ->orderBy('next_occurrence')
            ->get();
    }

    /**
     * Create a new reminder.
     */
    public function create(array $data): Reminder
    {
        $data['is_active'] = $data['is_active'] ?? true;

        $reminder = new Reminder($data);
        $reminder->calculateNextOccurrence();
        $reminder->save();

        return $reminder->load(['taskType', 'creator', 'animal']);
    }

    /**
     * Update a reminder.
     */
    public function update(Reminder $reminder, array $data): Reminder
    {
        $reminder->fill($data);
        $reminder->calculateNextOccurrence();
        $reminder->save();

        return $reminder->load(['taskType', 'creator', 'animal']);
    }

    /**
     * Delete a reminder.
     */
    public function delete(Reminder $reminder): bool
    {
        return $reminder->delete();
    }

    /**
     * Toggle reminder active status.
     */
    public function toggleActive(Reminder $reminder): Reminder
    {
        $reminder->is_active = !$reminder->is_active;
        if ($reminder->is_active) {
            $reminder->calculateNextOccurrence();
        }
        $reminder->save();

        return $reminder->load(['taskType', 'creator', 'animal']);
    }
}
