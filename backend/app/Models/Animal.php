<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Animal extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'animal_type_id',
        'pack_id',
        'breed',
        'birth_date',
        'sex',
        'weight',
        'chip_number',
        'notes',
        'image_path',
        'default_image_id',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'weight' => 'decimal:2',
    ];

    /**
     * Get the type of this animal.
     */
    public function type(): BelongsTo
    {
        return $this->belongsTo(AnimalType::class, 'animal_type_id');
    }

    /**
     * Get the pack this animal belongs to.
     */
    public function pack(): BelongsTo
    {
        return $this->belongsTo(Pack::class);
    }

    /**
     * Get the default image if selected.
     */
    public function defaultImage(): BelongsTo
    {
        return $this->belongsTo(DefaultAnimalImage::class, 'default_image_id');
    }

    /**
     * Get all reminders for this animal.
     */
    public function reminders(): HasMany
    {
        return $this->hasMany(Reminder::class);
    }

    /**
     * Get all task logs for this animal.
     */
    public function taskLogs(): HasMany
    {
        return $this->hasMany(TaskLog::class);
    }
}
