@extends('default::layouts.app')

@section('title', __('default::messages.search').' — '.config('app.name'))

@section('content')
    <header class="mb-8">
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {{ __('default::messages.search_results', ['query' => $search]) }}
        </h1>

        <form action="{{ route('default.search') }}" method="GET" class="mt-4 flex max-w-md gap-2">
            <input type="search" name="q" value="{{ $search }}" aria-label="{{ __('default::messages.search') }}" placeholder="{{ __('default::messages.search_placeholder') }}"
                   class="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
            <button type="submit" class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500">
                {{ __('default::messages.search') }}
            </button>
        </form>
    </header>

    @if ($posts->isEmpty())
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            {{ __('default::messages.no_search_results') }}
        </div>
    @else
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            @foreach ($posts as $post)
                @include('default::partials.post-card', ['post' => $post])
            @endforeach
        </div>

        {{ $posts->links('default::partials.pagination') }}
    @endif
@endsection
