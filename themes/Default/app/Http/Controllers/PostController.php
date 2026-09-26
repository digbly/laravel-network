<?php

namespace Themes\Default\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Routing\Controller;
use Modules\Blog\Models\Post;
use Themes\Default\Http\Controllers\Concerns\ListsPosts;

class PostController extends Controller
{
    use ListsPosts;

    public function show(string $slug): View
    {
        $post = $this->publishedPostsQuery()
            ->whereHas('translations', fn (Builder $query) => $query->where('slug', $slug))
            ->firstOrFail();

        Post::query()
            ->whereKey($post->getKey())
            ->increment('views');

        $post->views++;

        $comments = $post->comments()
            ->approved()
            ->whereNull('parent_id')
            ->with(['replies' => fn ($query) => $query->approved()->with('author')])
            ->with('author')
            ->latest()
            ->get();

        return view('default::post', [
            'post' => $post,
            'comments' => $comments,
        ]);
    }
}
