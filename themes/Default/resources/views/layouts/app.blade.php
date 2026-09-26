<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', config('app.name'))</title>
    <meta name="description" content="@yield('meta_description', config('app.name'))">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800" rel="stylesheet">

    <link rel="stylesheet" href="{{ theme_asset('css/theme.css') }}">

    @stack('meta')
</head>
<body class="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
    @include('default::partials.header')

    <main class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        @if (session('comment_status'))
            <div class="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                {{ session('comment_status') }}
            </div>
        @endif

        <div class="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div class="min-w-0">
                @yield('content')
            </div>

            @include('default::partials.sidebar')
        </div>
    </main>

    @include('default::partials.footer')
</body>
</html>
