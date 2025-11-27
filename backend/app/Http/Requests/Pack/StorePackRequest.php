<?php

namespace App\Http\Requests\Pack;

use App\Http\Requests\BaseRequest;

class StorePackRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
        ];
    }
}
