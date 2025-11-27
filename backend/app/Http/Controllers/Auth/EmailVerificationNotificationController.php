<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): JsonResponse|RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(
                config('app.frontend_url').'/dashboard'
            );
        }

        $locale = $request->input('locale', app()->getLocale());

        $request->user()->notify((new VerifyEmailNotification)->locale($locale));

        return response()->json([
            'code' => 'success_resend_verification_email',
            'message' => 'A new verification link has been sent to the email address you provided during registration.',
        ]);
    }
}
