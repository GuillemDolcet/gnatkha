<?php

namespace App\Services\SocialProviders;

use App\Concerns\Contracts\SocialProvidersAuthInterface;
use App\Http\Resources\UserSocialResource;
use Laravel\Socialite\Facades\Socialite;

class GithubService implements SocialProvidersAuthInterface
{
    public function callback(): UserSocialResource
    {
        $githubUser = Socialite::driver('github')->stateless()->user();

        return new UserSocialResource([
            'name' => $githubUser->getName() ?? $githubUser->getNickname(),
            'email' => $githubUser->getEmail(),
            'avatar' => $githubUser->getAvatar(),
            'social_provider_account_id' => $githubUser->getId(),
            'access_token' => $githubUser->token,
            'refresh_token' => $githubUser->refreshToken ?? null,
            'expired_at' => null,
        ]);
    }
}
