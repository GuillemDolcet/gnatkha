<?php

namespace App\Repositories;

use App\Models\SocialProvider;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;

class SocialProvidersRepository extends Repository
{
    /**
     * The actual model class supporting the business logic.
     */
    public function getModelClass(): string
    {
        return SocialProvider::class;
    }

    /**
     * *All* providers query context.
     */
    public function allContext(array $options = []): Builder
    {
        return $this->applyBuilderOptions($this->newQuery(), $options)->orderBy('id');
    }

    /**
     * Get *all* social providers from the database.
     *
     * @return Collection<int,SocialProvider>
     */
    public function all(array $options = []): Collection
    {
        return $this->allContext($options)->get();
    }

    /**
     * Instantiates a new SocialProvider object.
     */
    public function build(array $attributes = []): SocialProvider
    {
        return $this->make($attributes);
    }

    /**
     * Creates a SocialProvider instance.
     */
    public function create(array $attributes = []): ?SocialProvider
    {
        return $this->update($this->build(), $attributes);
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
     * Updates a social provider instance.
     */
    public function update(SocialProvider $instance, array $attributes = []): ?SocialProvider
    {
        $instance->fill($attributes);

        $result = $instance->save();

        if (! $result) {
            return null;
        }

        return $instance;
    }

    /**
     * Gets or creates a SocialProvider model instance.
     */
    public function firstOrCreate(array $attributes = [], array $where = ['email']): ?SocialProvider
    {
        $findBy = Arr::only($attributes, $where);

        if ($instance = $this->findBy($findBy)) {
            return $instance;
        }

        return $this->create($attributes);
    }
}
