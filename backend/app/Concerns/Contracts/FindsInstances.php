<?php

namespace App\Concerns\Contracts;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

interface FindsInstances
{
    /**
     * Finds a model instance by key.
     */
    public function find(mixed $id, array $options = []): ?Collection;

    /**
     * Finds a model instance by key.
     */
    public function findMany(array $keys, array $options = []): Collection;

    /**
     * Finds a model instance by the supplied attributes.
     */
    public function findBy(array $attributes, array $options = []): Builder|Model|null;

    /**
     * Get all model instances by the supplied attributes.
     */
    public function allBy(array $attributes, array $options = []): Collection|array;

    /**
     * Finds a model instance by key via the supplied context.
     */
    public function findViaContext(Builder $ctx, mixed $id, array $options = []): ?Collection;

    /**
     * Finds a model instance by the supplied attributes via the supplied context.
     */
    public function findByViaContext(Builder $ctx, array $attributes, array $options = []): Builder|Model|null;

    /**
     * Finds a model instance by key via the supplied context.
     */
    public function findManyViaContext(Builder $ctx, array $keys, array $options = []): Collection;
}
