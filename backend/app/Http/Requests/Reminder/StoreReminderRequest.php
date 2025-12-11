<?php

namespace App\Http\Requests\Reminder;

use App\Http\Requests\BaseRequest;
use App\Models\Animal;
use App\Models\Reminder;

class StoreReminderRequest extends BaseRequest
{
    public function authorize(): bool
    {
        $animal = Animal::find($this->animal_id);

        if (!$animal) {
            return false;
        }

        return $this->user()->can('create', [Reminder::class, $animal]);
    }

    public function rules(): array
    {
        return [
            'animal_id' => ['required', 'integer', 'exists:animals,id'],
            'task_type_id' => ['required', 'integer', 'exists:task_types,id'],
            'title' => ['required', 'string', 'min:1', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'frequency' => ['required', 'in:once,daily,weekly,monthly'],
            'day_of_week' => ['nullable', 'required_if:frequency,weekly', 'integer', 'min:0', 'max:6'],
            'day_of_month' => ['nullable', 'required_if:frequency,monthly', 'integer', 'min:1', 'max:31'],
            'time_of_day' => ['required', 'date_format:H:i'],
            'specific_date' => ['nullable', 'required_if:frequency,once', 'date', 'after_or_equal:today'],
        ];
    }
}
