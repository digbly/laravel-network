<?php

namespace App\Support;

use App\Contracts\Menu as MenuContract;
use Illuminate\Support\Collection;

class MenuRepository implements MenuContract
{
    protected array $menus = [];

    public function make(string $key, callable $callback): void
    {
        $this->menus[$key] = $callback;
    }

    public function get(string $key): ?array
    {
        if (! isset($this->menus[$key])) {
            return null;
        }

        return ($this->menus[$key])();
    }

    public function getByPosition(string $position): Collection
    {
        return collect($this->menus)
            ->map(function ($callback, $key) {
                $data = $callback();

                if (! $data) {
                    return null;
                }

                $data['key'] = $key;
                $prefix = $data['prefix'] ?? 'admin';

                if ($websiteId = request()->route('websiteId')) {
                    $prefix .= "/{$websiteId}";
                }

                if (! isset($data['url'])) {
                    $data['url'] = $key === 'dashboard'
                        ? url($prefix ?: '')
                        : url($prefix ? "{$prefix}/{$key}" : $key);
                } else {
                    $data['url'] = isset($data['prefix'])
                        ? url($data['prefix'].'/'.ltrim($data['url'], '/'))
                        : admin_url($data['url']);
                }

                $data['target'] ??= '_self';
                $data['icon'] ??= 'fa fa-circle';
                $data['priority'] ??= 20;
                $data['parent'] ??= null;
                $data['position'] ??= null;

                return $data;
            })
            ->filter()
            ->filter(
                fn ($menu) => ($menu['position'] ?? 'admin-left') === $position
            )
            ->values();
    }

    public function all(): Collection
    {
        return collect($this->menus)->map(
            fn ($callback) => $callback()
        );
    }
}
