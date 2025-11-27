<?php

namespace App\Notifications;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The password reset token.
     */
    public string $token;

    /**
     * Create a notification instance.
     */
    public function __construct(#[\SensitiveParameter] string $token)
    {
        $this->token = $token;
    }

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
        return $this->buildMailMessage($this->resetUrl($notifiable));
    }

    /**
     * Get the reset password notification mail message for the given URL.
     */
    protected function buildMailMessage(string $url): MailMessage
    {
        return (new MailMessage)
            ->subject(Lang::get('auth.reset_password_notification'))
            ->line(Lang::get('auth.reset_password_notification_text'))
            ->action(Lang::get('auth.reset_password'), $url)
            ->line(Lang::get('auth.reset_password_expires',
                [
                    'count' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire'),
                ]
            ))
            ->line(Lang::get('auth.no_further_action'));
    }

    /**
     * Get the reset URL for the given notifiable.
     */
    protected function resetUrl(mixed $notifiable): string
    {
        return config('app.frontend_url')."/auth/password-reset/$this->token?email={$notifiable->getEmailForPasswordReset()}";
    }
}
