<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class PasswordResetLinkRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'exists:users,email'],
            'locale' => ['required', Rule::in(['en', 'es'])],
        ];
    }
}
