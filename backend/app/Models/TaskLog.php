<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'animal_id',
        'task_type_id',
        'user_id',
        'reminder_id',
        'title',
        'notes',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    /**
     * Get the animal this log belongs to.
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    /**
     * Get the task type of this log.
     */
    public function taskType(): BelongsTo
    {
        return $this->belongsTo(TaskType::class);
    }

    /**
     * Get the user who completed this task.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the reminder this log was created from (if any).
     */
    public function reminder(): BelongsTo
    {
        return $this->belongsTo(Reminder::class);
    }
}
