<?php


namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'animal_id',
        'task_type_id',
        'created_by',
        'title',
        'description',
        'frequency',
        'day_of_week',
        'day_of_month',
        'time_of_day',
        'specific_date',
        'is_active',
        'next_occurrence',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
        'day_of_month' => 'integer',
        'time_of_day' => 'datetime:H:i',
        'specific_date' => 'date',
        'is_active' => 'boolean',
        'next_occurrence' => 'datetime',
    ];

    /**
     * Get the animal this reminder belongs to.
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    /**
     * Get the task type of this reminder.
     */
    public function taskType(): BelongsTo
    {
        return $this->belongsTo(TaskType::class);
    }

    /**
     * Get the user who created this reminder.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all task logs created from this reminder.
     */
    public function taskLogs(): HasMany
    {
        return $this->hasMany(TaskLog::class);
    }

    /**
     * Calculate and set the next occurrence based on frequency.
     */
    public function calculateNextOccurrence(): void
    {
        $now = Carbon::now();
        $time = Carbon::parse($this->time_of_day);

        switch ($this->frequency) {
            case 'once':
                if ($this->specific_date) {
                    $next = Carbon::parse($this->specific_date)
                        ->setTime($time->hour, $time->minute);
                    $this->next_occurrence = $next->isPast() ? null : $next;
                }
                break;

            case 'daily':
                $next = $now->copy()->setTime($time->hour, $time->minute);
                if ($next->isPast()) {
                    $next->addDay();
                }
                $this->next_occurrence = $next;
                break;

            case 'weekly':
                $next = $now->copy()->setTime($time->hour, $time->minute);
                $daysUntil = ($this->day_of_week - $now->dayOfWeek + 7) % 7;
                if ($daysUntil === 0 && $next->isPast()) {
                    $daysUntil = 7;
                }
                $next->addDays($daysUntil);
                $this->next_occurrence = $next;
                break;

            case 'monthly':
                $next = $now->copy()
                    ->setDay(min($this->day_of_month, $now->daysInMonth))
                    ->setTime($time->hour, $time->minute);
                if ($next->isPast()) {
                    $next->addMonth();
                    $next->setDay(min($this->day_of_month, $next->daysInMonth));
                }
                $this->next_occurrence = $next;
                break;
        }
    }

    /**
     * Advance to the next occurrence after completing.
     */
    public function advanceToNextOccurrence(): void
    {
        if ($this->frequency === 'once') {
            $this->is_active = false;
            $this->next_occurrence = null;
        } else {
            $this->calculateNextOccurrence();
        }
        $this->save();
    }
}
