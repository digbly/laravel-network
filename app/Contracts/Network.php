<?php

namespace App\Contracts;

use App\Models\Website;
use App\Support\NetworkRepository;

/**
 * @see NetworkRepository
 */
interface Network
{
    public function init(null|string|Website $website = null): void;

    public function website(): ?Website;

    public function currentIsMainSite(): bool;
}
