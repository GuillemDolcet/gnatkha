<?php

namespace App\Repositories;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class PushSubscriptionsRepository
{
    /**
     * Get all subscriptions for a user.
     */
    public function allForUser(User $user): Collection
    {
        return $user->pushSubscriptions()->get();
    }

    /**
     * Find subscription by endpoint.
     */
    public function findByEndpoint(string $endpoint): ?PushSubscription
    {
        return PushSubscription::where('endpoint', $endpoint)->first();
    }

    /**
     * Create or update a subscription.
     */
    public function createOrUpdate(User $user, array $data): PushSubscription
    {
        return PushSubscription::updateOrCreate(
            ['endpoint' => $data['endpoint']],
            [
                'user_id' => $user->id,
                'p256dh_key' => $data['keys']['p256dh'],
                'auth_token' => $data['keys']['auth'],
                'user_agent' => $data['user_agent'] ?? null,
            ]
        );
    }

    /**
     * Delete a subscription by endpoint.
     */
    public function deleteByEndpoint(string $endpoint): bool
    {
        return PushSubscription::where('endpoint', $endpoint)->delete() > 0;
    }

    /**
     * Get all subscriptions for users in a pack.
     */
    public function forPackMembers(int $packId): Collection
    {
        return PushSubscription::whereHas('user.packs', function ($query) use ($packId) {
            $query->where('packs.id', $packId);
        })->get();
    }

    /**
     * Update last used timestamp.
     */
    public function markAsUsed(PushSubscription $subscription): void
    {
        $subscription->update(['last_used_at' => now()]);
    }
}
