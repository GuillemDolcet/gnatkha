<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class RedirectIfNotSignedToFrontend
{
    public function handle(Request $request, Closure $next)
    {
        // Check if the URL has a valid signature
        if (! URL::hasValidSignature($request)) {
            if ($request->route()?->named('verification.verify')) {
                return redirect()->intended(
                    config('app.frontend_url').'/auth/verify-email?error='.base64_encode('invalid_signature')
                );
            }

            return redirect()->intended(
                config('app.frontend_url').'/dashboard'
            );
        }

        return $next($request);
    }
}
