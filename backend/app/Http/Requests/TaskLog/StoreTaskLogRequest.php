<?php

namespace App\Http\Requests\TaskLog;

use App\Http\Requests\BaseRequest;
use App\Models\Animal;
use App\Models\TaskLog;

class StoreTaskLogRequest extends BaseRequest
{
    public function authorize(): bool
    {
        $animal = Animal::find($this->animal_id);

        if (!$animal) {
            return false;
        }

        return $this->user()->can('create', [TaskLog::class, $animal]);
    }

    public function rules(): array
    {
        return [
            'animal_id' => ['required', 'integer', 'exists:animals,id'],
            'task_type_id' => ['required', 'integer', 'exists:task_types,id'],
            'reminder_id' => ['nullable', 'integer', 'exists:reminders,id'],
            'title' => ['required', 'string', 'min:1', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'completed_at' => ['nullable', 'date'],
        ];
    }
}
