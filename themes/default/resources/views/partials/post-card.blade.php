@php
    $translation = $post->resolvedTranslation();
    $url = $translation?->slug ? route('default.posts.show', $translation->slug) : null;
@endphp

@if ($url)
    <article class="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/60">
        <div class="flex flex-1 flex-col p-6">
            @if ($post->categories->isNotEmpty())
                <div class="mb-3 flex flex-wrap gap-2">
                    @foreach ($post->categories as $category)
                        @php($categoryTranslation = $category->resolvedTranslation())
                        @if ($categoryTranslation?->slug)
                            <a href="{{ route('default.categories.show', $categoryTranslation->slug) }}"
                               class="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100">
                                {{ $categoryTranslation->name }}
                            </a>
                        @endif
                    @endforeach
                </div>
            @endif

            <h2 class="text-lg font-bold leading-snug text-slate-900 transition group-hover:text-indigo-600">
                <a href="{{ $url }}">{{ $translation->title }}</a>
            </h2>

            @if ($translation->description)
                <p class="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500">
                    {{ $translation->description }}
                </p>
            @endif

            <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
                <span class="font-medium text-slate-500">{{ $post->author?->name ?? config('app.name') }}</span>
                <time datetime="{{ $post->created_at?->toIso8601String() }}">{{ $post->created_at?->format('M d, Y') }}</time>
            </div>
        </div>
    </article>
@endif
