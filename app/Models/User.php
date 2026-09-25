<?php

namespace App\Models;

use App\Traits\HasPassportPasswordGrant;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;
use Laravel\Passport\Passport;
use Modules\Membership\Traits\HasMembership;

class User extends Authenticatable implements MustVerifyEmail, OAuthenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasMembership, HasPassportPasswordGrant, HasUuids, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
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
    public const ROLE_USER = 'user';

    public const ROLE_ADMIN = 'admin';

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function socialConnections(): HasMany
    {
        return $this->hasMany(UserSocialConnection::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Resolve the password grant client (config or DB fallback).
     *
     * @return array{client_id: string|null, client_secret: string|null}
     */
    public static function resolvePasswordClient(): array
    {
        $config = config('auth.providers.users.passport', []);
        $clientId = $config['client_id'] ?? null;
        $clientSecret = $config['client_secret'] ?? null;

        if (!$clientId || !$clientSecret) {
            $client = Passport::client()
                ->newQuery()
                ->where('revoked', false)
                ->where('password_client', true)
                ->first();

            if ($client) {
                $clientId = $client->id;
                $clientSecret = $client->secret;
            }
        }

        return [
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
        ];
    }
}
