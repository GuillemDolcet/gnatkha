<?php

namespace App\Http\Requests\Reminder;

use App\Http\Requests\BaseRequest;

class UpdateReminderRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('reminder'));
    }

    public function rules(): array
    {
        return [
            'task_type_id' => ['required', 'integer', 'exists:task_types,id'],
            'title' => ['required', 'string', 'min:1', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'frequency' => ['required', 'in:once,daily,weekly,monthly'],
            'day_of_week' => ['nullable', 'required_if:frequency,weekly', 'integer', 'min:0', 'max:6'],
            'day_of_month' => ['nullable', 'required_if:frequency,monthly', 'integer', 'min:1', 'max:31'],
            'time_of_day' => ['required', 'date_format:H:i'],
            'specific_date' => ['nullable', 'required_if:frequency,once', 'date'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
