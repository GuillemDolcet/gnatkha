<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnimalType extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
    ];

    /**
     * Get all animals of this type.
     */
    public function animals(): HasMany
    {
        return $this->hasMany(Animal::class);
    }

    /**
     * Get default images for this type.
     */
    public function defaultImages(): HasMany
    {
        return $this->hasMany(DefaultAnimalImage::class);
    }
}
