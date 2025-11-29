<?php

namespace App\Http\Requests\TaskLog;

use App\Http\Requests\BaseRequest;

class UpdateTaskLogRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('taskLog'));
    }

    public function rules(): array
    {
        return [
            'task_type_id' => ['required', 'integer', 'exists:task_types,id'],
            'title' => ['required', 'string', 'min:1', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'completed_at' => ['nullable', 'date'],
        ];
    }
}
