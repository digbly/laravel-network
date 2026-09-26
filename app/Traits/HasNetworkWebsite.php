<?php

namespace App\Traits;

use App\Models\Website;
use App\Observers\NetworkWebsiteObserver;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait HasNetworkWebsite
{
    public static function bootHasNetworkWebsite(): void
    {
        static::observe(NetworkWebsiteObserver::class);
    }

    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class, 'website_id');
    }
}
