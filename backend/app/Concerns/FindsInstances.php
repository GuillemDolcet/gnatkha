<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

trait FindsInstances
{
    /**
     * Finds a model instance by key.
     */
    public function find(mixed $id, array $options = []): ?Collection
    {
        if (is_array($id)) {
            return $this->findMany($id);
        }

        $query = $this->applyBuilderOptions($this->newQuery(), $options);

        return $query->whereKey($id)->first();
    }

    /**
     * Finds a model instance by key.
     */
    public function findMany(array $keys, array $options = []): Collection
    {
        $query = $this->applyBuilderOptions($this->newQuery(), $options);

        return $query->whereKey($keys)->get();
    }

    /**
     * Finds a model instance by the supplied attributes.
     */
    public function findBy(array $attributes, array $options = []): Builder|Model|null
    {
        $query = $this->applyBuilderOptions($this->newQuery(), $options);

        return $query->where($attributes)->first();
    }

    /**
     * Finds the last instance of a model by key.
     */
    public function findLast(array $options = []): Builder|Model|null
    {
        $query = $this->applyBuilderOptions($this->newQuery(), $options);

        return $query->latest()->first();
    }

    /**
     * Get all model instances by the supplied attributes.
     */
    public function allBy(array $attributes, array $options = []): Collection|array
    {
        $query = $this->applyBuilderOptions($this->newQuery(), $options);

        return $query->where($attributes)->get();
    }

    /**
     * Get all model instance for the supplied column attribute values.
     */
    public function findManyBy(string $column, array $values, array $options = []): Collection|array
    {
        $query = $this->applyBuilderOptions($this->newQuery(), $options);

        return $query->whereIn($column, $values)->get();
    }

    /**
     * Finds a model instance by key via the supplied context.
     */
    public function findViaContext(Builder $ctx, mixed $id, array $options = []): ?Collection
    {
        if (is_array($id)) {
            return $this->findManyViaContext($ctx, $id, $options);
        }

        $ctx = $this->applyBuilderOptions($ctx, $options);

        return $ctx->where($this->getInstance()->getKeyName(), '=', $id)->first();
    }

    /**
     * Finds a model instance by the supplied attributes via the supplied context.
     */
    public function findByViaContext(Builder $ctx, array $attributes, array $options = []): Builder|Model|null
    {
        $ctx = $this->applyBuilderOptions($ctx, $options);

        return $ctx->where($attributes)->first();
    }

    /**
     * Finds a model instance by key via the supplied context.
     */
    public function findManyViaContext(Builder $ctx, array $keys, array $options = []): Collection
    {
        $ctx = $this->applyBuilderOptions($ctx, $options);

        return $ctx->whereIn($this->getInstance()->getKeyName(), $keys)->get();
    }

    /**
     * Applies the supplied options to the given query builder object.
     */
    protected function applyBuilderOptions(Builder $query, array $options = []): Builder
    {
        if (isset($options['with'])) {
            $eagers = (array) $options['with'];

            if (count($eagers) > 0) {
                $query->with($eagers);
            }
        }

        if (isset($options['sort_by'])) {
            if (is_array($options['sort_by'])) {
                [$column, $direction] = $options['sort_by'];

                $query->orderBy($column, $direction);
            } elseif (is_string($options['sort_by']) && str_contains($options['sort_by'], ',')) {
                $sortBy = explode(',', $options['sort_by']);

                if ($sortBy[0] !== '') {
                    $query->orderBy($sortBy[0], $sortBy[1] ?? 'asc');
                }
            } else {
                $query->orderBy($options['sort_by']);
            }
        }

        if (isset($options['limit'])) {
            $query->limit((int) $options['limit']);
        }

        if (isset($options['with-trashed']) && $options['with-trashed']) {
            $query->withTrashed();
        }

        return $query;
    }
}
