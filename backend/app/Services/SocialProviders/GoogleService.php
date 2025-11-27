<?php

namespace App\Services\SocialProviders;

use App\Concerns\Contracts\SocialProvidersAuthInterface;
use App\Http\Resources\UserSocialResource;
use Laravel\Socialite\Facades\Socialite;

class GoogleService implements SocialProvidersAuthInterface
{
    public function callback(): UserSocialResource
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        return new UserSocialResource([
            'name' => $googleUser->getName(),
            'email' => $googleUser->getEmail(),
            'avatar' => $googleUser->getAvatar(),
            'social_provider_account_id' => $googleUser->getId(),
            'access_token' => $googleUser->token,
            'refresh_token' => $googleUser->refreshToken ?? null,
            'expired_at' => now()->addSeconds($googleUser->expiresIn),
        ]);
    }
}
