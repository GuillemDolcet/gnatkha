<?php

namespace App\Policies;

use App\Models\Animal;
use App\Models\Reminder;
use App\Models\User;

class ReminderPolicy
{
    /**
     * Determine whether the user can view reminders for an animal.
     */
    public function viewAny(User $user, Animal $animal): bool
    {
        return $animal->pack->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can view the reminder.
     */
    public function view(User $user, Reminder $reminder): bool
    {
        return $reminder->animal->pack->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create reminders for an animal.
     */
    public function create(User $user, Animal $animal): bool
    {
        return $animal->pack->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can update the reminder.
     */
    public function update(User $user, Reminder $reminder): bool
    {
        return $reminder->animal->pack->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can delete the reminder.
     */
    public function delete(User $user, Reminder $reminder): bool
    {
        // Solo el creador o admin del pack puede eliminar
        if ($reminder->created_by === $user->id) {
            return true;
        }

        return $reminder->animal->pack->members()
            ->where('user_id', $user->id)
            ->where('is_admin', true)
            ->exists();
    }
}
