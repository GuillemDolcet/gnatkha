<?php

namespace App\Policies;

use App\Models\Pack;
use App\Models\User;

class PackPolicy
{
    public function view(User $user, Pack $pack): bool
    {
        return $pack->members()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Pack $pack): bool
    {
        return $this->isAdmin($user, $pack);
    }

    public function delete(User $user, Pack $pack): bool
    {
        return $this->isAdmin($user, $pack);
    }

    public function leave(User $user, Pack $pack): bool
    {
        if ($this->isAdmin($user, $pack)) {
            return false;
        }

        return $pack->members()->where('user_id', $user->id)->exists();
    }

    public function removeMember(User $user, Pack $pack, User $member): bool
    {
        if ($user->id === $member->id) {
            return false;
        }

        if ($this->isAdmin($member, $pack)) {
            return false;
        }

        return $this->isAdmin($user, $pack);
    }

    public function transferAdmin(User $user, Pack $pack, User $newAdmin): bool
    {
        if ($user->id === $newAdmin->id) {
            return false;
        }

        if (!$pack->members()->where('user_id', $newAdmin->id)->exists()) {
            return false;
        }

        return $this->isAdmin($user, $pack);
    }

    protected function isAdmin(User $user, Pack $pack): bool
    {
        $member = $pack->members()->where('user_id', $user->id)->first();

        return $member && $member->pivot->is_admin;
    }
}
