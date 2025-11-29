<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReminderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if (!$this->relationLoaded('taskType')) {
            $this->load('taskType');
        }

        return [
            'id' => $this->id,
            'animal_id' => $this->animal_id,
            'animal' => new AnimalResource($this->whenLoaded('animal')),
            'task_type' => $this->taskType ? new TaskTypeResource($this->taskType) : null,
            'creator' => new UserResource($this->whenLoaded('creator')),
            'title' => $this->title,
            'description' => $this->description,
            'frequency' => $this->frequency,
            'day_of_week' => $this->day_of_week,
            'day_of_month' => $this->day_of_month,
            'time_of_day' => $this->time_of_day?->format('H:i'),
            'specific_date' => $this->specific_date?->format('Y-m-d'),
            'is_active' => $this->is_active,
            'next_occurrence' => $this->next_occurrence?->toISOString(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
