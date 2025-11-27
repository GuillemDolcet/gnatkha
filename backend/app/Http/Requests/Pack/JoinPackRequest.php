<?php

namespace App\Http\Requests\Pack;

use App\Http\Requests\BaseRequest;
use App\Models\Pack;
use App\Repositories\PacksRepository;

class JoinPackRequest extends BaseRequest
{
    public ?Pack $pack = null;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invitation_code' => ['required', 'string', 'size:8'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->any()) {
                return;
            }

            $repository = app(PacksRepository::class);

            $this->pack = $repository->findByInvitationCode($this->invitation_code);

            if (!$this->pack) {
                $validator->errors()->add('invitation_code', 'invalid_invitation_code');
                return;
            }

            if ($repository->isMember($this->pack, $this->user())) {
                $validator->errors()->add('invitation_code', 'already_member');
            }
        });
    }
}
