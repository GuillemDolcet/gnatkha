<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // /// Relations //////////////////////////////////////////////////////////////////////////////////////////////////

    public function socialProviders(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this
            ->belongsToMany(SocialProvider::class, 'user_social_providers', 'user_id', 'social_provider_id')
            ->withPivot(
                [
                    'social_provider_account_id',
                    'access_token',
                    'refresh_token',
                    'expires_at',
                ]
            )
            ->withTimestamps();
    }

    public function packs(): BelongsToMany
    {
        return $this->belongsToMany(Pack::class, 'user_pack')
            ->withPivot('is_admin')
            ->withTimestamps();
    }
}
