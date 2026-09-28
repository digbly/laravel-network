@php($posts = app(\Themes\Default\Support\SidebarData::class)->recent((int) ($data['limit'] ?? 5)))
<section class="rounded-2xl border border-slate-200 bg-white p-6">
    <h2 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">{{ $sidebar->label ?: __('default::messages.recent_posts') }}</h2>
    <ul class="space-y-4">
        @forelse ($posts as $post)
            @php($translation = $post->resolvedTranslation())
            @if ($translation?->slug)
                <li>
                    <a href="{{ route('default.posts.show', $translation->slug) }}" class="group block">
                        <p class="text-sm font-semibold text-slate-700 transition group-hover:text-indigo-600">
                            {{ $translation->title }}
                        </p>
                        <p class="mt-1 text-xs text-slate-400">{{ $post->created_at?->format('M d, Y') }}</p>
                    </a>
                </li>
            @endif
        @empty
            <li class="text-sm text-slate-400">{{ __('default::messages.no_posts') }}</li>
        @endforelse
    </ul>
</section>
