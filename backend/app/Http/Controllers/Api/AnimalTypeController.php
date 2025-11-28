<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnimalTypeResource;
use App\Repositories\AnimalTypesRepository;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AnimalTypeController extends Controller
{
    public function __construct(
        protected AnimalTypesRepository $repository
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $types = $this->repository->allWithDefaultImages();

        return AnimalTypeResource::collection($types);
    }
}
