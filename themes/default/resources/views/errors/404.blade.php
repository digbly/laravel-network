@extends('default::layouts.app')

@section('title', __('default::messages.not_found').' — '.config('app.name'))

@section('content')
    <div class="rounded-3xl border border-slate-200 bg-white p-12 text-center">
        <p class="text-6xl font-extrabold text-indigo-600">404</p>
        <h1 class="mt-4 text-2xl font-bold text-slate-900">{{ __('default::messages.not_found') }}</h1>
        <p class="mt-2 text-slate-500">{{ __('default::messages.not_found_description') }}</p>
        <a href="{{ route('default.home') }}"
           class="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500">
            {{ __('default::messages.back_home') }}
        </a>
    </div>
@endsection
