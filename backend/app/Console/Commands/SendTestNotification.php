<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\Push\WebPushService;
use Illuminate\Console\Command;

class SendTestNotification extends Command
{
    protected $signature = 'push:test {user_id?}';
    protected $description = 'Send a test push notification';

    public function __construct(
        private WebPushService $pushService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $userId = $this->argument('user_id');

        if ($userId) {
            $user = User::find($userId);
        } else {
            $user = User::whereHas('pushSubscriptions')->first();
        }

        if (!$user) {
            $this->error('No user found with push subscriptions');
            return 1;
        }

        $this->info("Sending test notification to: {$user->name} ({$user->email})");

        $result = $this->pushService->sendToUser($user->id, [
            'title' => '🐾 PackTrack - Test',
            'body' => '¡Las notificaciones funcionan correctamente!',
            'icon' => '/icons/icon-192x192.png',
            'data' => [
                'url' => '/reminders',
                'test' => true,
            ],
        ]);

        $this->info("Result: {$result['success']} sent, {$result['failed']} failed, " . count($result['expired']) . " expired");

        return 0;
    }
}
