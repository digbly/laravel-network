<?php

namespace App\Facades;

use App\Contracts\Network as NetworkContract;
use App\Support\NetworkRepository;
use Illuminate\Support\Facades\Facade;

/**
 * @method static void init(null|string|\App\Models\Website $website = null)
 * @method static \App\Models\Website|null website()
 * @method static bool currentIsMainSite()
 *
 * @see NetworkRepository
 */
class Network extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return NetworkContract::class;
    }
}
