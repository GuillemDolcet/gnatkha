<?php

namespace App\Policies;

use App\Models\Animal;
use App\Models\Pack;
use App\Models\User;

class AnimalPolicy
{
    /**
     * Determine whether the user can view any animals in the pack.
     */
    public function viewAny(User $user, Pack $pack): bool
    {
        return $pack->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can view the animal.
     */
    public function view(User $user, Animal $animal): bool
    {
        return $animal->pack->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create animals in the pack.
     */
    public function create(User $user, Pack $pack): bool
    {
        return $pack->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can update the animal.
     */
    public function update(User $user, Animal $animal): bool
    {
        return $animal->pack->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can delete the animal.
     */
    public function delete(User $user, Animal $animal): bool
    {
        return $animal->pack->members()
            ->where('user_id', $user->id)
            ->where('is_admin', true)
            ->exists();
    }
}
