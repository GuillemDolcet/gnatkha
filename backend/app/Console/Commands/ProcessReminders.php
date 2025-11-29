<?php

namespace App\Console\Commands;

use App\Repositories\RemindersRepository;
use App\Services\Push\WebPushService;
use Illuminate\Console\Command;

class ProcessReminders extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'reminders:process';

    /**
     * The console command description.
     */
    protected $description = 'Process due reminders and send push notifications';

    public function __construct(
        private RemindersRepository $remindersRepository,
        private WebPushService $pushService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $reminders = $this->remindersRepository->getDueReminders();

        $this->info("Found {$reminders->count()} due reminders");

        foreach ($reminders as $reminder) {
            $this->info("Processing reminder: {$reminder->title} for {$reminder->animal->name}");

            // Enviar notificación push
            $results = $this->pushService->sendReminderNotification($reminder);

            $this->info("  - Sent: {$results['success']}, Failed: {$results['failed']}");

            // Avanzar al siguiente recordatorio
            $reminder->advanceToNextOccurrence();
        }

        return Command::SUCCESS;
    }
}
