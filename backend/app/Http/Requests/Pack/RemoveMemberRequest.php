<?php

namespace App\Http\Requests\Pack;

use App\Http\Requests\BaseRequest;
use App\Repositories\PacksRepository;

class RemoveMemberRequest extends BaseRequest
{
    public function authorize(): bool
    {
        $pack = $this->route('pack');
        $user = $this->route('user');

        return $this->user()->can('removeMember', [$pack, $user]);
    }

    public function rules(): array
    {
        return [];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $repository = app(PacksRepository::class);

            $pack = $this->route('pack');
            $user = $this->route('user');

            if (!$repository->isMember($pack, $user)) {
                $validator->errors()->add('user', 'user_not_member');
            }
        });
    }
}
