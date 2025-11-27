<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PackResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'invitation_code' => $this->invitation_code,
            'members_count' => $this->whenCounted('members'),
            'is_admin' => $this->whenPivotLoaded('user_pack', fn() => $this->pivot->is_admin),
            'members' => MemberResource::collection($this->whenLoaded('members')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
