<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class AnimalResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $imageUrl = null;

        if ($this->image_path) {
            $imageUrl = Storage::disk('public')->url($this->image_path);
        } elseif ($this->default_image_id && $this->defaultImage) {
            $imageUrl = asset($this->defaultImage->image_path);
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => new AnimalTypeResource($this->whenLoaded('type')),
            'pack_id' => $this->pack_id,
            'pack' => new PackResource($this->whenLoaded('pack')),
            'breed' => $this->breed,
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'sex' => $this->sex,
            'weight' => $this->weight,
            'chip_number' => $this->chip_number,
            'notes' => $this->notes,
            'image_url' => $imageUrl,
            'default_image_id' => $this->default_image_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
