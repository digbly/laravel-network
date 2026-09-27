@extends('default::layouts.app')

@section('title', ($heading ?? __('default::messages.latest_posts')).' — '.config('app.name'))

@section('content')
    <header class="mb-8">
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{{ $heading }}</h1>
        @if (! empty($subheading))
            <p class="mt-2 text-slate-500">{{ $subheading }}</p>
        @endif
    </header>

    @if ($posts->isEmpty())
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            {{ __('default::messages.no_posts') }}
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
