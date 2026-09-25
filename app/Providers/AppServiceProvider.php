<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;
use Modules\Auth\Models\OAuthClient;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Passport::tokensCan([
            'profile' => 'Read the authenticated user profile',
        ]);
        Passport::useClientModel(OAuthClient::class);
        Passport::authorizationView('auth.authorize');
        Passport::tokensExpireIn(now()->addDays(2));
        Passport::refreshTokensExpireIn(now()->addDays(30));
        Passport::personalAccessTokensExpireIn(now()->addMonths(6));
        // Passport::enablePasswordGrant();

        // Customize email verification URL to point to web frontend
        VerifyEmail::toMailUsing(static function (object $notifiable, string $url): MailMessage {
            $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));
            $id = $notifiable->getKey();
            $hash = sha1($notifiable->getEmailForVerification());
            $verifyUrl = $frontendUrl.'/auth/verify-email/'.$id.'/'.$hash;

            return (new MailMessage)
                ->subject(__('auth.verify_email.subject'))
                ->line(__('auth.verify_email.line_1'))
                ->action(__('auth.verify_email.action'), $verifyUrl)
                ->line(__('auth.verify_email.line_2'));
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
        });
    }
}
