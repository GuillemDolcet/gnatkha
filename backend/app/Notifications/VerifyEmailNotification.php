<?php

namespace App\Notifications;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The callback that should be used to create the verify email URL.
     */
    public static ?\Closure $createUrlCallback;

    /**
     * The callback that should be used to build the mail message.
     *
     * @var (\Closure(mixed, string): \Illuminate\Notifications\Messages\MailMessage|\Illuminate\Contracts\Mail\Mailable)|null
     */
    public static \Illuminate\Contracts\Mail\Mailable|\Closure|null $toMailCallback;

    /**
     * Get the notification's channels.
     */
    public function via(mixed $notifiable): array|string
    {
        return ['mail'];
    }

    /**
     * Build the mail representation of the notification.
     */
    public function toMail(mixed $notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return $this->buildMailMessage($verificationUrl);
    }

    /**
     * Get the verify email notification mail message for the given URL.
     */
    protected function buildMailMessage(string $url): MailMessage
    {
        return (new MailMessage)
            ->subject(Lang::get('auth.verify_email_address'))
            ->line(Lang::get('auth.verify_email_address_click'))
            ->action(Lang::get('auth.verify_email_address'), $url)
            ->line(Lang::get('auth.no_further_action'));
    }

    /**
     * Get the verification URL for the given notifiable.
     */
    protected function verificationUrl(mixed $notifiable): string
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }
}
