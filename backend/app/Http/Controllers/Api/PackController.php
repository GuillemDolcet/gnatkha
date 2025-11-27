<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pack\JoinPackRequest;
use App\Http\Requests\Pack\LeavePackRequest;
use App\Http\Requests\Pack\RemoveMemberRequest;
use App\Http\Requests\Pack\StorePackRequest;
use App\Http\Requests\Pack\TransferAdminRequest;
use App\Http\Requests\Pack\UpdatePackRequest;
use App\Http\Resources\MemberResource;
use App\Http\Resources\PackResource;
use App\Models\Pack;
use App\Models\User;
use App\Repositories\PacksRepository;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PackController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected PacksRepository $repository
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $packs = $this->repository->allForUser($request->user());

        return PackResource::collection($packs);
    }

    public function show(Request $request, Pack $pack): PackResource
    {
        $this->authorize('view', $pack);

        $pack = $this->repository->findWithMembers($pack);

        return new PackResource($pack);
    }

    public function store(StorePackRequest $request): JsonResponse
    {
        $pack = $this->repository->create(
            $request->validated(),
            $request->user()
        );

        $pack = $this->repository->getPackForUser($pack, $request->user());

        return (new PackResource($pack))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdatePackRequest $request, Pack $pack): PackResource
    {
        $this->repository->update($pack, $request->validated());

        return new PackResource($pack);
    }

    public function destroy(Request $request, Pack $pack): JsonResponse
    {
        $this->authorize('delete', $pack);

        $this->repository->delete($pack);

        return response()->json(null, 204);
    }

    public function join(JoinPackRequest $request): JsonResponse
    {
        $this->repository->addMember($request->pack, $request->user());

        $pack = $this->repository->getPackForUser($request->pack, $request->user());

        return (new PackResource($pack))
            ->response()
            ->setStatusCode(201);
    }

    public function leave(LeavePackRequest $request, Pack $pack): JsonResponse
    {
        $this->repository->leave($pack, $request->user());

        return response()->json(null, 204);
    }

    public function members(Request $request, Pack $pack): AnonymousResourceCollection
    {
        $this->authorize('view', $pack);

        $members = $this->repository->getMembers($pack);

        return MemberResource::collection($members);
    }

    public function removeMember(RemoveMemberRequest $request, Pack $pack, User $user): JsonResponse
    {
        $this->repository->removeMember($pack, $user);

        return response()->json(null, 204);
    }

    public function transferAdmin(TransferAdminRequest $request, Pack $pack, User $user): JsonResponse
    {
        $this->repository->transferAdmin($pack, $request->user(), $user);

        return response()->json(null, 204);
    }
}
