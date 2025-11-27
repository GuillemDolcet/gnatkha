<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\PasswordResetLinkRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetLinkController extends Controller
{
    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(PasswordResetLinkRequest $request): JsonResponse
    {
        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        $locale = $request->input('locale', 'en');

        $status = Password::sendResetLink(
            $request->only('email'),
            static function ($user) use ($locale) {
                $user->notify(
                    (new \App\Notifications\ResetPasswordNotification(
                        app('auth.password.broker')->createToken($user)
                    ))->locale($locale)
                );
            }
        );

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [
                    [
                        'code' => 'throttle_error',
                        'message' => __($status),
                    ],
                ],
            ]);
        }

        return response()->json([
            'code' => 'success_password_reset_link_sent',
            'message' => 'We have emailed your password reset link.',
        ]);
    }
}
