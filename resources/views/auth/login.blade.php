<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sign in</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; display: flex; justify-content: center; padding: 48px 16px; }
        main { width: 100%; max-width: 360px; }
        h1 { font-size: 1.25rem; margin-bottom: 1rem; }
        label { display: block; font-size: .8rem; margin: .75rem 0 .25rem; }
        input[type="email"], input[type="password"] { width: 100%; padding: .6rem .7rem; border-radius: .5rem; border: 1px solid #334155; background: #1e293b; color: inherit; box-sizing: border-box; }
        button, .provider { display: block; width: 100%; padding: .6rem .7rem; border-radius: .5rem; border: 1px solid #334155; background: #6366f1; color: #fff; margin-top: .75rem; text-align: center; text-decoration: none; cursor: pointer; }
        .provider { background: #1e293b; }
        ul { color: #f87171; font-size: .8rem; padding-left: 1rem; }
        .muted { color: #94a3b8; font-size: .8rem; text-align: center; margin: 1rem 0 .25rem; }
    </style>
</head>
<body>
<main>
    <h1>Sign in</h1>

    @if ($errors->any())
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    @endif

    <form method="POST" action="{{ route('login.attempt') }}">
        @csrf
        @if ($redirect)
            <input type="hidden" name="redirect" value="{{ $redirect }}">
        @endif

        <label for="email">Email</label>
        <input id="email" type="email" name="email" value="{{ old('email') }}" required autofocus autocomplete="email">

        <label for="password">Password</label>
        <input id="password" type="password" name="password" required autocomplete="current-password">

        <label>
            <input type="checkbox" name="remember" value="1" @checked(old('remember'))>
            Remember me
        </label>

        <button type="submit">Sign in</button>
    </form>

    @if (count($providers))
        <p class="muted">Or continue with</p>
        @foreach ($providers as $provider)
            <a class="provider" href="{{ route('social.redirect', ['driver' => $provider->value, 'redirect' => $redirect]) }}">
                {{ $provider->label() }}
            </a>
        @endforeach
    @endif
</main>
</body>
</html>
