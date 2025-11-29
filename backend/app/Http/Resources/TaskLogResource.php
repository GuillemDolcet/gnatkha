<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'animal_id' => $this->animal_id,
            'animal' => new AnimalResource($this->whenLoaded('animal')),
            'task_type' => new TaskTypeResource($this->whenLoaded('taskType')),
            'user' => new UserResource($this->whenLoaded('user')),
            'reminder_id' => $this->reminder_id,
            'title' => $this->title,
            'notes' => $this->notes,
            'completed_at' => $this->completed_at?->toISOString(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
