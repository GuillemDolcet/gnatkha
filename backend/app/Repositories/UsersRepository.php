<?php

namespace App\Repositories;

use App\Models\SocialProvider;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Throwable;

class UsersRepository extends Repository
{
    /**
     * The actual model class supporting the business logic.
     */
    public function getModelClass(): string
    {
        return User::class;
    }

    /**
     * *All* users query context.
     */
    public function allContext(array $options = []): Builder
    {
        return $this->applyBuilderOptions($this->newQuery(), $options)->orderBy('id');
    }

    /**
     * Get *all* users from the database.
     *
     * @return Collection<int,User>
     */
    public function all(array $options = []): Collection
    {
        return $this->allContext($options)->get();
    }

    /**
     * Instantiates a new User object.
     */
    public function build(array $attributes = []): User
    {
        return $this->make($attributes);
    }

    /**
     * Creates a User instance.
     */
    public function create(array $attributes = [], SocialProvider $social = null): ?User
    {
        return $this->update($this->build(), $attributes, $social);
    }

    /**
     * Listing result set.
     */
    public function listing(Builder $context, array $options = []): LengthAwarePaginator
    {
        $options = array_merge(['per_page' => 30], $options);

        return $context->paginate($options['per_page']);
    }

    /**
     * Updates a user instance.
     * @throws Throwable
     */
    public function update(User $instance, array $attributes = [], SocialProvider $social = null): ?User
    {
        return DB::transaction(static function () use ($social, $instance, $attributes) {
            $instance->fill($attributes);

            $result = $instance->save();

            if ($social) {
                $pivotData = [
                    'social_provider_account_id' => $attributes['social_provider_account_id'],
                    'access_token'               => $attributes['access_token'],
                    'refresh_token'              => $attributes['refresh_token'],
                    'expires_at'                 => $attributes['expired_at'],
                ];

                if ($instance->socialProviders()->where('social_provider_id', $social->getKey())->exists()) {
                    $instance->socialProviders()->updateExistingPivot($social->getKey(), $pivotData);
                } else {
                    $instance->socialProviders()->attach($social->getKey(), $pivotData);
                }
            }

            if (! $result) {
                return null;
            }

            return $instance;
        });
    }

    /**
     * Gets or creates a User model instance.
     */
    public function firstOrCreate(array $attributes = [], array $where = ['email']): ?User
    {
        $findBy = Arr::only($attributes, $where);

        if ($instance = $this->findBy($findBy)) {
            return $instance;
        }

        return $this->create($attributes);
    }

    /**
     * Finds a user by its email attribute.
     */
    public function findByEmail(string $email, array $options = []): ?User
    {
        return $this->findBy(['email' => $email], $options);
    }
}
