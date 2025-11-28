<?php

namespace App\Repositories;

use App\Models\AnimalType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class AnimalTypesRepository extends Repository
{
    /**
     * The actual model class supporting the business logic.
     */
    public function getModelClass(): string
    {
        return AnimalType::class;
    }

    /**
     * *All* animal types query context.
     */
    public function allContext(array $options = []): Builder
    {
        return $this->applyBuilderOptions($this->newQuery(), $options)->orderBy('id');
    }

    /**
     * Get *all* animal types from the database.
     *
     * @return Collection<int,AnimalType>
     */
    public function all(array $options = []): Collection
    {
        return $this->allContext($options)->get();
    }

    /**
     * Get all animal types with their default images.
     *
     * @return Collection<int,AnimalType>
     */
    public function allWithDefaultImages(): Collection
    {
        return $this->newQuery()->with('defaultImages')->orderBy('id')->get();
    }

    /**
     * Find an animal type by its key.
     */
    public function findByKey(string $key): ?AnimalType
    {
        return $this->newQuery()->where('key', $key)->first();
    }
}
