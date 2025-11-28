<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DefaultAnimalImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'animal_type_id',
        'image_path',
    ];

    /**
     * Get the animal type this image belongs to.
     */
    public function animalType(): BelongsTo
    {
        return $this->belongsTo(AnimalType::class);
    }
}
