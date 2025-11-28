<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Animal\StoreAnimalRequest;
use App\Http\Requests\Animal\UpdateAnimalRequest;
use App\Http\Resources\AnimalResource;
use App\Models\Animal;
use App\Models\Pack;
use App\Repositories\AnimalsRepository;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AnimalController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected AnimalsRepository $repository
    ) {}

    public function index(Request $request, Pack $pack): AnonymousResourceCollection
    {
        $this->authorize('viewAny', [Animal::class, $pack]);

        $animals = $this->repository->allForPack($pack);

        return AnimalResource::collection($animals);
    }

    public function show(Request $request, Animal $animal): AnimalResource
    {
        $this->authorize('view', $animal);

        $animal = $this->repository->findWithType($animal);

        return new AnimalResource($animal);
    }

    public function store(StoreAnimalRequest $request): JsonResponse
    {
        $pack = Pack::findOrFail($request->validated('pack_id'));

        $animal = $this->repository->create(
            $request->safe()->except(['image', 'pack_id']),
            $pack,
            $request->file('image')
        );

        $animal = $this->repository->findWithType($animal);

        return (new AnimalResource($animal))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateAnimalRequest $request, Animal $animal): AnimalResource
    {
        $this->repository->update(
            $animal,
            $request->safe()->except(['image']),
            $request->file('image')
        );

        $animal = $this->repository->findWithType($animal);

        return new AnimalResource($animal);
    }

    public function destroy(Request $request, Animal $animal): JsonResponse
    {
        $this->authorize('delete', $animal);

        $this->repository->delete($animal);

        return response()->json(null, 204);
    }
}
