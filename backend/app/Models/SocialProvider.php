<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialProvider extends Model
{
    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
    ];

    public const SOCIAL_PROVIDER_GOOGLE = 'google';

    public const SOCIAL_PROVIDER_GITHUB = 'github';

    public static function defaults(): array
    {
        return [
            self::SOCIAL_PROVIDER_GOOGLE,
            self::SOCIAL_PROVIDER_GITHUB,
        ];
    }

    // / Relations //////////////////////////////////////////////////////////////////////////////////////////////////

    public function users(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this
            ->belongsToMany(User::class, 'user_social_providers', 'social_provider_id', 'user_id')
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
}
