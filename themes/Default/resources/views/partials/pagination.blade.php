@if ($paginator->hasPages())
    <nav role="navigation" aria-label="Pagination" class="mt-10 flex items-center justify-center gap-2">
        @if ($paginator->onFirstPage())
            <span class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-300">&larr;</span>
        @else
            <a href="{{ $paginator->previousPageUrl() }}" rel="prev"
               class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600">&larr;</a>
        @endif

        @foreach ($elements as $element)
            @if (is_string($element))
                <span class="px-2 text-sm text-slate-400">{{ $element }}</span>
            @endif

            @if (is_array($element))
                @foreach ($element as $page => $url)
                    @if ($page == $paginator->currentPage())
                        <span aria-current="page" class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">{{ $page }}</span>
                    @else
                        <a href="{{ $url }}" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600">{{ $page }}</a>
                    @endif
                @endforeach
            @endif
        @endforeach

        @if ($paginator->hasMorePages())
            <a href="{{ $paginator->nextPageUrl() }}" rel="next"
               class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600">&rarr;</a>
        @else
            <span class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-300">&rarr;</span>
        @endif
    </nav>
@endif
