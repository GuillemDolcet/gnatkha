<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskTypeResource;
use App\Repositories\TaskTypesRepository;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TaskTypeController extends Controller
{
    public function __construct(
        protected TaskTypesRepository $repository
    ) {}

    /**
     * List all task types.
     */
    public function index(): AnonymousResourceCollection
    {
        return TaskTypeResource::collection($this->repository->all());
    }
}
