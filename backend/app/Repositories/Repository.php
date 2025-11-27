<?php

namespace App\Repositories;

use App\Concerns\Contracts\FindsInstances as FindsInstancesContract;
use App\Concerns\Contracts\Repository as RepositoryContract;
use App\Concerns\FindsInstances;
use Closure;
use Illuminate\Contracts\Support\MessageProvider as MessageProviderContract;
use Illuminate\Database\Connection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\MessageBag;
use Throwable;

abstract class Repository implements FindsInstancesContract, MessageProviderContract, RepositoryContract
{
    use FindsInstances;

    /**
     * Error messages.
     */
    protected ?MessageBag $messages;

    /**
     * The actual model class supporting the business logic.
     */
    abstract public function getModelClass(): string;

    /**
     * Returns an instance of the current database connection.
     */
    public function getConnection(): Connection
    {
        return $this->getInstance()->getConnection();
    }

    /**
     * Instantiates a new instance of the current repository's model class.
     */
    public function getInstance(): mixed
    {
        $klass = $this->getModelClass();

        return new $klass;
    }

    /**
     * Instantiates a new instance of the current repository's model class with
     * the supplied attributes.
     */
    public function make(array $attributes = []): mixed
    {
        $instance = $this->getInstance();

        $instance->fill($attributes);

        return $instance;
    }

    /**
     * Get a new query builder for the model's table.
     */
    public function newQuery(): Builder
    {
        return $this->getInstance()->newQuery();
    }

    /**
     * Get the message container for this repository.
     */
    public function messages(): MessageBag
    {
        return $this->messages;
    }

    /**
     * An alternative more semantic shortcut to the message container.
     */
    public function errors(): MessageBag
    {
        return $this->messages();
    }

    /**
     * Get the messages for the instance.
     */
    public function getMessageBag(): MessageBag
    {
        return $this->messages();
    }

    /**
     * Adds an error message to the container.
     */
    public function addError(string $key, string $message): MessageBag
    {
        if (! $this->messages) {
            $this->messages = new MessageBag;
        }

        return $this->messages->add($key, $message);
    }

    /**
     * Execute a Closure within a transaction.
     *
     *
     * @throws Throwable
     */
    public function transaction(Closure $callback): mixed
    {
        return $this->getConnection()->transaction($callback);
    }
}
