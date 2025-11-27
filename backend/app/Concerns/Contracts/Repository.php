<?php

namespace App\Concerns\Contracts;

use Illuminate\Database\Eloquent\Builder;

interface Repository
{
    /**
     * The actual model class supporting the business logic.
     */
    public function getModelClass(): string;

    /**
     * Instantiates a new instance of the current repository's model class.
     */
    public function getInstance(): mixed;

    /**
     * Instantiates a new instance of the current repository's model class with
     * the supplied attributes.
     *
     * If no attributes are supplied it should be just an alias for `getInstance()`.
     */
    public function make(array $attributes = []): mixed;

    /**
     * Get a new query builder for the model's table.
     */
    public function newQuery(): Builder;
}
