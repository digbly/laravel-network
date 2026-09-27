@extends('default::layouts.app')

@php($translation = $post->resolvedTranslation())

@section('title', ($translation?->title ?? $post->getKey()).' — '.config('app.name'))
@section('meta_description', $translation?->description ?? config('app.name'))

@section('content')
    <article class="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div class="border-b border-slate-100 bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-10 text-white sm:px-10">
            @if ($post->categories->isNotEmpty())
                <div class="mb-4 flex flex-wrap gap-2">
                    @foreach ($post->categories as $category)
                        @php($categoryTranslation = $category->resolvedTranslation())
                        @if ($categoryTranslation?->slug)
                            <a href="{{ route('default.categories.show', $categoryTranslation->slug) }}"
                               class="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/25">
                                {{ $categoryTranslation->name }}
                            </a>
                        @endif
                    @endforeach
                </div>
            @endif

            <h1 class="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{{ $translation?->title }}</h1>

            @if ($translation?->description)
                <p class="mt-3 max-w-2xl text-indigo-100">{{ $translation->description }}</p>
            @endif

            <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-indigo-100">
                <span class="font-semibold text-white">{{ $post->author?->name ?? config('app.name') }}</span>
                <time datetime="{{ $post->created_at?->toIso8601String() }}">{{ $post->created_at?->format('M d, Y') }}</time>
                <span>{{ $post->views }} {{ __('default::messages.views') }}</span>
            </div>
        </div>

        <div class="article-content px-6 py-10 sm:px-10">
            {{-- Post content is HTML authored by users with blog-editor permission; render as-is. --}}
            {!! $translation?->content !!}
        </div>
    </article>

    <section id="comments" class="mt-10">
        <h2 class="mb-6 text-2xl font-bold tracking-tight text-slate-900">
            {{ __('default::messages.comments') }}
            <span class="ml-1 text-slate-400">{{ $comments->count() }}</span>
        </h2>

        @if ($comments->isEmpty())
            <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                {{ __('default::messages.no_comments') }}
            </div>
        @else
            <div class="space-y-5">
                @foreach ($comments as $comment)
                    @include('default::partials.comment', ['comment' => $comment])
                @endforeach
            </div>
        @endif

        <div class="mt-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h3 class="text-lg font-bold text-slate-900">{{ __('default::messages.leave_comment') }}</h3>

            @if ($errors->any())
                <div class="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <ul class="list-inside list-disc space-y-1">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <form action="{{ route('default.comments.store', $post) }}" method="POST" class="mt-5 space-y-4">
                @csrf

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label for="comment-name" class="mb-1 block text-sm font-medium text-slate-700">{{ __('default::messages.name') }}</label>
                        <input id="comment-name" type="text" name="name" value="{{ old('name', auth()->user()?->name) }}" required
                               class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100">
                    </div>
                    <div>
                        <label for="comment-email" class="mb-1 block text-sm font-medium text-slate-700">{{ __('default::messages.email') }}</label>
                        <input id="comment-email" type="email" name="email" value="{{ old('email', auth()->user()?->email) }}" required
                               class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100">
                    </div>
                </div>

                <div>
                    <label for="comment-content" class="mb-1 block text-sm font-medium text-slate-700">{{ __('default::messages.content') }}</label>
                    <textarea id="comment-content" name="content" rows="5" required
                              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100">{{ old('content') }}</textarea>
                </div>

                <button type="submit" class="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500">
                    {{ __('default::messages.submit_comment') }}
                </button>
            </form>
        </div>
    </section>
@endsection
