<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserSocialResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'name' => $this['name'],
            'email' => $this['email'],
            'avatar' => $this['avatar'],
            'access_token' => $this['access_token'],
            'refresh_token' => $this['refresh_token'],
            'expired_at' => $this['expired_at'],
            'social_provider_account_id' => $this['social_provider_account_id'],
        ];
    }
}
