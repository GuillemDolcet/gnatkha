<?php

namespace App\Http\Requests\Pack;

use App\Http\Requests\BaseRequest;

class UpdatePackRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('pack'));
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:1', 'max:255'],
        ];
    }
}
