<?php

namespace App\Policies;

use App\Models\Animal;
use App\Models\TaskLog;
use App\Models\User;

class TaskLogPolicy
{
    /**
     * Determine whether the user can view logs for an animal.
     */
    public function viewAny(User $user, Animal $animal): bool
    {
        return $animal->pack->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can view the log.
     */
    public function view(User $user, TaskLog $log): bool
    {
        return $log->animal->pack->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create logs for an animal.
     */
    public function create(User $user, Animal $animal): bool
    {
        return $animal->pack->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can update the log.
     */
    public function update(User $user, TaskLog $log): bool
    {
        // Solo el que registró la tarea o admin puede editar
        if ($log->user_id === $user->id) {
            return true;
        }

        return $log->animal->pack->members()
            ->where('user_id', $user->id)
            ->where('is_admin', true)
            ->exists();
    }

    /**
     * Determine whether the user can delete the log.
     */
    public function delete(User $user, TaskLog $log): bool
    {
        // Solo el que registró la tarea o admin puede eliminar
        if ($log->user_id === $user->id) {
            return true;
        }

        return $log->animal->pack->members()
            ->where('user_id', $user->id)
            ->where('is_admin', true)
            ->exists();
    }
}
