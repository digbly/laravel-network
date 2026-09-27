<?php

namespace Themes\Default\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Themes\Default\Http\Controllers\Concerns\ListsPosts;

class HomeController extends Controller
{
    use ListsPosts;

    public function index(): View
    {
        $posts = $this->publishedPostsQuery()
            ->latest()
            ->paginate((int) config('default.per_page', 9));

        return view('default::home', [
            'posts' => $posts,
            'heading' => __('default::messages.latest_posts'),
            'subheading' => __('default::messages.latest_posts_subtitle'),
        ]);
    }

    public function search(Request $request): View
    {
        $search = trim((string) $request->query('q', ''));

        $posts = $this->publishedPostsQuery()
            ->when($search !== '', fn (Builder $query) => $query->whereHas(
                'translations',
                fn (Builder $query) => $query->where('title', 'like', "%{$search}%")
            ))
            ->latest()
            ->paginate((int) config('default.per_page', 9))
            ->withQueryString();

        return view('default::search', [
            'posts' => $posts,
            'search' => $search,
        ]);
    }
}
