<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Push\StorePushSubscriptionRequest;
use App\Repositories\PushSubscriptionsRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function __construct(
        protected PushSubscriptionsRepository $repository
    ) {}

    /**
     * Store or update a push subscription.
     */
    public function store(StorePushSubscriptionRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_agent'] = $request->userAgent();

        $subscription = $this->repository->createOrUpdate($request->user(), $data);

        return response()->json([
            'message' => 'Subscription saved successfully',
            'id' => $subscription->id,
        ]);
    }

    /**
     * Delete a push subscription.
     */
    public function destroy(Request $request): JsonResponse
    {
        $endpoint = $request->input('endpoint');

        if (!$endpoint) {
            return response()->json(['error' => 'Endpoint required'], 400);
        }

        $deleted = $this->repository->deleteByEndpoint($endpoint);

        return response()->json([
            'message' => $deleted ? 'Subscription removed' : 'Subscription not found',
        ], $deleted ? 200 : 404);
    }

    /**
     * Get VAPID public key for push notifications.
     */
    public function vapidPublicKey(): JsonResponse
    {
        return response()->json([
            'publicKey' => config('webpush.vapid.public_key'),
        ]);
    }
}
