<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Minishlink\WebPush\VAPID;

class GenerateVapidKeys extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'webpush:generate-keys';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate VAPID keys for Web Push Notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating VAPID keys...');

        $keys = VAPID::createVapidKeys();

        $this->line('');
        $this->info('Public Key:');
        $this->line($keys['publicKey']);

        $this->line('');
        $this->info('Private Key:');
        $this->line($keys['privateKey']);

        $this->line('');
        $this->comment('Add these to your .env file:');
        $this->line("VAPID_PUBLIC_KEY={$keys['publicKey']}");
        $this->line("VAPID_PRIVATE_KEY={$keys['privateKey']}");

        return Command::SUCCESS;
    }
}
