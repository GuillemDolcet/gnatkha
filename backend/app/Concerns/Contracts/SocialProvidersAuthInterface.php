<?php

namespace App\Concerns\Contracts;

use App\Http\Resources\UserSocialResource;

interface SocialProvidersAuthInterface
{
    /**
     * The actual model class supporting the business logic.
     */
    public function callback(): UserSocialResource;
}
