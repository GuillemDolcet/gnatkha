<?php

namespace App\Services\Push;

use App\Models\PushSubscription;
use App\Models\Reminder;
use App\Repositories\PushSubscriptionsRepository;
use Illuminate\Support\Collection;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class WebPushService
{
    private WebPush $webPush;

    public function __construct(
        protected PushSubscriptionsRepository $subscriptionsRepository
    ) {
        $this->webPush = new WebPush([
            'VAPID' => [
                'subject' => config('webpush.vapid.subject'),
                'publicKey' => config('webpush.vapid.public_key'),
                'privateKey' => config('webpush.vapid.private_key'),
            ],
        ]);
    }

    /**
     * Send notification for a reminder to all pack members.
     */
    public function sendReminderNotification(Reminder $reminder): array
    {
        $packId = $reminder->animal->pack_id;
        $subscriptions = $this->subscriptionsRepository->forPackMembers($packId);

        $payload = json_encode([
            'title' => $reminder->title,
            'body' => $reminder->animal->name . ' - ' . $reminder->taskType->key,
            'icon' => '/icons/icon-192x192.png',
            'badge' => '/icons/badge-72x72.png',
            'data' => [
                'type' => 'reminder',
                'reminder_id' => $reminder->id,
                'animal_id' => $reminder->animal_id,
                'url' => '/dashboard/animals/' . $reminder->animal_id,
            ],
            'actions' => [
                ['action' => 'complete', 'title' => 'Marcar como hecho'],
                ['action' => 'snooze', 'title' => 'Recordar en 10 min'],
            ],
        ]);

        return $this->sendToSubscriptions($subscriptions, $payload);
    }

    /**
     * Send a custom notification to a user's devices.
     */
    public function sendToUser(int $userId, array $notification): array
    {
        $subscriptions = PushSubscription::where('user_id', $userId)->get();

        $payload = json_encode([
            'title' => $notification['title'],
            'body' => $notification['body'],
            'icon' => $notification['icon'] ?? '/icons/icon-192x192.png',
            'badge' => $notification['badge'] ?? '/icons/badge-72x72.png',
            'data' => $notification['data'] ?? [],
        ]);

        return $this->sendToSubscriptions($subscriptions, $payload);
    }

    /**
     * Send notification to multiple subscriptions.
     */
    private function sendToSubscriptions(Collection $subscriptions, string $payload): array
    {
        $results = [
            'success' => 0,
            'failed' => 0,
            'expired' => [],
        ];

        foreach ($subscriptions as $sub) {
            $subscription = Subscription::create([
                'endpoint' => $sub->endpoint,
                'publicKey' => $sub->p256dh_key,
                'authToken' => $sub->auth_token,
            ]);

            $this->webPush->queueNotification($subscription, $payload);
        }

        foreach ($this->webPush->flush() as $report) {
            if ($report->isSuccess()) {
                $results['success']++;
            } else {
                $results['failed']++;

                // Si la suscripción expiró, marcarla para eliminar
                if ($report->isSubscriptionExpired()) {
                    $results['expired'][] = $report->getEndpoint();
                }
            }
        }

        // Eliminar suscripciones expiradas
        foreach ($results['expired'] as $endpoint) {
            $this->subscriptionsRepository->deleteByEndpoint($endpoint);
        }

        return $results;
    }
}
