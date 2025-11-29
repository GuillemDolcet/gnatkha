<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaskType extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'icon',
        'color',
    ];

    /**
     * Get all reminders of this type.
     */
    public function reminders(): HasMany
    {
        return $this->hasMany(Reminder::class);
    }

    /**
     * Get all task logs of this type.
     */
    public function taskLogs(): HasMany
    {
        return $this->hasMany(TaskLog::class);
    }
}
