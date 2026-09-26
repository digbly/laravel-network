<?php

namespace Themes\Default\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Routing\Controller;
use Modules\Blog\Models\Category;
use Themes\Default\Http\Controllers\Concerns\ListsPosts;

class CategoryController extends Controller
{
    use ListsPosts;

    public function show(string $slug): View
    {
        $category = Category::query()
            ->with('translations')
            ->whereHas('translations', fn (Builder $query) => $query->where('slug', $slug))
            ->firstOrFail();

        $posts = $category->posts()
            ->published()
            ->with($this->postRelations())
            ->latest()
            ->paginate((int) config('default.per_page', 9));

        $translation = $category->resolvedTranslation();

        return view('default::category', [
            'category' => $category,
            'posts' => $posts,
            'heading' => $translation?->name ?? $category->getKey(),
            'subheading' => $translation?->description,
        ]);
    }
}
