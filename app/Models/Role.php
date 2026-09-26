<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    protected static function booted(): void
    {
        static::addGlobalScope('website_id', function (Builder $builder) {
            $websiteId = website_id();

            if ($websiteId === null) {
                return;
            }

            $table = $builder->getModel()->getTable();

            $builder->where(
                fn (Builder $query) => $query
                    ->where("{$table}.website_id", $websiteId)
                    ->orWhereNull("{$table}.website_id")
            );
        });
    }
}
