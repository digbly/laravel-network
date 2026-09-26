<header class="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <a href="{{ route('default.home') }}" class="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h10M4 18h7" />
                </svg>
            </span>
            {{ config('app.name', 'Blog') }}
        </a>

        <nav class="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="{{ route('default.home') }}" class="transition hover:text-indigo-600">{{ __('default::messages.all_posts') }}</a>
            @foreach ($navCategories as $navCategory)
                @php($navTranslation = $navCategory->resolvedTranslation())
                @if ($navTranslation?->slug)
                    <a href="{{ route('default.categories.show', $navTranslation->slug) }}" class="transition hover:text-indigo-600">
                        {{ $navTranslation->name }}
                    </a>
                @endif
            @endforeach
        </nav>

        <form action="{{ route('default.search') }}" method="GET" class="relative hidden sm:block">
            <input type="search" name="q" value="{{ request('q') }}" aria-label="{{ __('default::messages.search') }}" placeholder="{{ __('default::messages.search_placeholder') }}"
                   class="w-44 rounded-full border border-slate-200 bg-slate-100 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:w-56 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
            </svg>
        </form>
    </div>
</header>
