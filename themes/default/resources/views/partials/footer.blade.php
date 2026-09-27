<footer class="mt-16 border-t border-slate-200 bg-white">
    <div class="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <p>&copy; {{ now()->year }} {{ config('app.name', 'Blog') }}. {{ __('default::messages.all_posts') }}.</p>
        <a href="{{ route('default.home') }}" class="font-medium text-indigo-600 transition hover:text-indigo-500">
            {{ __('default::messages.back_home') }}
        </a>
    </div>
</footer>
