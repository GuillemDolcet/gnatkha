<?php

namespace App\Repositories;

use App\Models\Pack;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class PacksRepository extends Repository
{
    /**
     * The actual model class supporting the business logic.
     */
    public function getModelClass(): string
    {
        return Pack::class;
    }

    /**
     * *All* packs query context.
     */
    public function allContext(array $options = []): Builder
    {
        return $this->applyBuilderOptions($this->newQuery(), $options)->orderBy('id');
    }

    /**
     * Get *all* packs from the database.
     *
     * @return Collection<int,Pack>
     */
    public function all(array $options = []): Collection
    {
        return $this->allContext($options)->get();
    }

    /**
     * Get all packs for a user with pivot data and member count.
     *
     * @return Collection<int,Pack>
     */
    public function allForUser(User $user): Collection
    {
        return $user
            ->packs()
            ->withPivot('is_admin')
            ->withCount('members')
            ->get();
    }

    /**
     * Get a pack with members loaded.
     */
    public function findWithMembers(Pack $pack): Pack
    {
        return $pack->load('members');
    }

    /**
     * Get pack members.
     *
     * @return Collection<int,User>
     */
    public function getMembers(Pack $pack): Collection
    {
        return $pack->members;
    }

    /**
     * Instantiates a new Pack object.
     */
    public function build(array $attributes = []): Pack
    {
        return $this->make($attributes);
    }

    /**
     * Creates a Pack instance with a user as admin.
     */
    public function create(array $attributes, User $user): ?Pack
    {
        return $this->transaction(function () use ($attributes, $user) {
            $attributes['invitation_code'] = $this->generateUniqueInvitationCode();

            $pack = $this->update($this->build(), $attributes);

            if (!$pack) {
                return null;
            }

            $pack->members()->attach($user->id, ['is_admin' => true]);

            return $pack;
        });
    }

    /**
     * Updates a Pack instance.
     */
    public function update(Pack $instance, array $attributes = []): ?Pack
    {
        $instance->fill($attributes);

        $result = $instance->save();

        if (!$result) {
            return null;
        }

        return $instance;
    }

    /**
     * Deletes a Pack instance.
     */
    public function delete(Pack $pack): bool
    {
        return $this->transaction(function () use ($pack) {
            $pack->members()->detach();

            return $pack->delete();
        });
    }

    /**
     * Find a pack by invitation code.
     */
    public function findByInvitationCode(string $code): ?Pack
    {
        return $this->newQuery()->where('invitation_code', $code)->first();
    }

    /**
     * Check if a user is a member of a pack.
     */
    public function isMember(Pack $pack, User $user): bool
    {
        return $pack->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Add a member to a pack.
     */
    public function addMember(Pack $pack, User $user): bool
    {
        if ($this->isMember($pack, $user)) {
            return false;
        }

        $pack->members()->attach($user->id, ['is_admin' => false]);

        return true;
    }

    /**
     * Remove a member from a pack.
     */
    public function removeMember(Pack $pack, User $user): bool
    {
        return $pack->members()->detach($user->id) > 0;
    }

    /**
     * User leaves a pack.
     */
    public function leave(Pack $pack, User $user): bool
    {
        return $this->removeMember($pack, $user);
    }

    /**
     * Transfer admin role to another member.
     */
    public function transferAdmin(Pack $pack, User $currentAdmin, User $newAdmin): bool
    {
        return $this->transaction(function () use ($pack, $currentAdmin, $newAdmin) {
            $pack->members()->updateExistingPivot($currentAdmin->id, ['is_admin' => false]);
            $pack->members()->updateExistingPivot($newAdmin->id, ['is_admin' => true]);

            return true;
        });
    }

    /**
     * Get pack with user's pivot data and member count.
     */
    public function getPackForUser(Pack $pack, User $user): ?Pack
    {
        return $user
            ->packs()
            ->withPivot('is_admin')
            ->withCount('members')
            ->find($pack->id);
    }

    /**
     * Generate a unique 8-character invitation code.
     */
    protected function generateUniqueInvitationCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while ($this->newQuery()->where('invitation_code', $code)->exists());

        return $code;
    }
}
