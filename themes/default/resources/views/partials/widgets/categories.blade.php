@php($categories = app(\Themes\Default\Support\SidebarData::class)->categories())
<section class="rounded-2xl border border-slate-200 bg-white p-6">
    <h2 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">{{ $sidebar->label ?: __('default::messages.categories') }}</h2>
    <ul class="space-y-2 text-sm">
        @forelse ($categories as $category)
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
