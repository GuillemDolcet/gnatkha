<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectIfNotAuthenticatedToFrontend
{
    public function handle(Request $request, Closure $next)
    {
        if (! Auth::check()) {
            return redirect()->intended(
                config('app.frontend_url').'/dashboard'
            );
        }

        return $next($request);
    }
}
