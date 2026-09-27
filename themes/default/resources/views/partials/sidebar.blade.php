<aside class="space-y-8">
    <section class="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">{{ __('default::messages.categories') }}</h2>
        <ul class="space-y-2 text-sm">
            @forelse ($sidebar['categories'] as $category)
                @php($translation = $category->resolvedTranslation())
                @if ($translation?->slug)
                    <li>
                        <a href="{{ route('default.categories.show', $translation->slug) }}"
                           class="flex items-center justify-between text-slate-600 transition hover:text-indigo-600">
                            <span>{{ $translation->name }}</span>
                            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                                {{ $category->posts_count }}
                            </span>
                        </a>
                    </li>
                @endif
            @empty
                <li class="text-slate-400">{{ __('default::messages.no_posts') }}</li>
            @endforelse
        </ul>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">{{ __('default::messages.recent_posts') }}</h2>
        <ul class="space-y-4">
            @forelse ($sidebar['recent'] as $recent)
                @php($translation = $recent->resolvedTranslation())
                @if ($translation?->slug)
                    <li>
                        <a href="{{ route('default.posts.show', $translation->slug) }}" class="group block">
                            <p class="text-sm font-semibold text-slate-700 transition group-hover:text-indigo-600">
                                {{ $translation->title }}
                            </p>
                            <p class="mt-1 text-xs text-slate-400">{{ $recent->created_at?->format('M d, Y') }}</p>
                        </a>
                    </li>
                @endif
            @empty
                <li class="text-sm text-slate-400">{{ __('default::messages.no_posts') }}</li>
            @endforelse
        </ul>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">{{ __('default::messages.popular_posts') }}</h2>
        <ul class="space-y-4">
            @forelse ($sidebar['popular'] as $popular)
                @php($translation = $popular->resolvedTranslation())
                @if ($translation?->slug)
                    <li>
                        <a href="{{ route('default.posts.show', $translation->slug) }}" class="group block">
                            <p class="text-sm font-semibold text-slate-700 transition group-hover:text-indigo-600">
                                {{ $translation->title }}
                            </p>
                            <p class="mt-1 text-xs text-slate-400">{{ $popular->views }} {{ __('default::messages.views') }}</p>
                        </a>
                    </li>
                @endif
            @empty
                <li class="text-sm text-slate-400">{{ __('default::messages.no_posts') }}</li>
            @endforelse
        </ul>
    </section>
</aside>
