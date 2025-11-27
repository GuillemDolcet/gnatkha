<?php

namespace App\Http\Requests\Pack;

use App\Http\Requests\BaseRequest;

class LeavePackRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('leave', $this->route('pack'));
    }

    public function rules(): array
    {
        return [];
    }
}
