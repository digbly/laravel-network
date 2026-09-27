<?php

namespace Themes\Default\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Modules\Blog\Models\Category;
use Modules\Blog\Models\Post;

class SidebarData
{
    /**
     * @return array{categories: Collection, recent: Collection, popular: Collection}
     */
    public function get(): array
    {
        $limit = max(1, (int) config('default.sidebar.recent', 5));
        $popularLimit = max(1, (int) config('default.sidebar.popular', 5));

        return [
            'categories' => Category::query()
                ->with('translations')
                ->withCount(['posts' => fn (Builder $query) => $query->published()])
                ->orderBy('created_at')
                ->get(),
            'recent' => Post::query()
                ->published()
                ->with('translations')
                ->latest()
                ->orderBy('id')
                ->limit($limit)
                ->get(),
            'popular' => Post::query()
                ->published()
                ->with('translations')
                ->orderByDesc('views')
                ->latest()
                ->orderBy('id')
                ->limit($popularLimit)
                ->get(),
        ];
    }
}
