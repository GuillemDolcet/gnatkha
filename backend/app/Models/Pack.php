<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Auth;

class Pack extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'invitation_code',
    ];

    /**
     * Get the is_admin attribute for the currently authenticated user.
     */
    public function getIsAdminAttribute(): bool
    {
        $user = Auth::user();

        if (!$user) {
            return false;
        }

        if ($this->relationLoaded('members')) {
            $member = $this->members->firstWhere('id', $user->id);
            if ($member && $member->pivot) {
                return (bool) $member->pivot->is_admin;
            }
        }

        return (bool) $this->members()
            ->where('user_id', $user->id)
            ->value('is_admin');
    }

    // /// Relations //////////////////////////////////////////////////////////////////////////////////////////////////

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_pack')
            ->withPivot('is_admin')
            ->withTimestamps();
    }

    public function admins(): BelongsToMany
    {
        return $this->members()->wherePivot('is_admin', true);
    }

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'is_admin',
    ];
}
