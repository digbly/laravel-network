@php($isOpen = old('parent_id') === $comment->id)
<div class="rounded-2xl border border-slate-200 bg-white p-5">
    <div class="flex items-center gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
            {{ mb_strtoupper(mb_substr($comment->author_name, 0, 1)) }}
        </span>
        <div>
            <p class="text-sm font-semibold text-slate-800">{{ $comment->author_name }}</p>
            <p class="text-xs text-slate-400">{{ $comment->created_at?->format('M d, Y H:i') }}</p>
        </div>
    </div>

    <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{{ $comment->content }}</p>

    <details class="mt-3" @if ($isOpen) open @endif>
        <summary class="cursor-pointer text-xs font-semibold text-indigo-600 transition hover:text-indigo-500">
            {{ __('default::messages.reply') }}
        </summary>

        <form action="{{ route('default.comments.store', $post) }}" method="POST" class="mt-4 space-y-3">
            @csrf
            <input type="hidden" name="parent_id" value="{{ $comment->id }}">

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input type="text" name="name" required aria-label="{{ __('default::messages.name') }}" placeholder="{{ __('default::messages.name') }}" value="{{ $isOpen ? old('name') : '' }}"
                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100">
                <input type="email" name="email" required aria-label="{{ __('default::messages.email') }}" placeholder="{{ __('default::messages.email') }}" value="{{ $isOpen ? old('email') : '' }}"
                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100">
            </div>

            <textarea name="content" rows="3" required aria-label="{{ __('default::messages.content') }}" placeholder="{{ __('default::messages.content') }}"
                      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100">{{ $isOpen ? old('content') : '' }}</textarea>

            <button type="submit" class="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700">
                {{ __('default::messages.reply') }}
            </button>
        </form>
    </details>

    @if ($comment->replies->isNotEmpty())
        <div class="mt-5 space-y-4 border-l-2 border-slate-100 pl-4 sm:pl-5">
            @foreach ($comment->replies as $reply)
                @include('default::partials.comment', ['comment' => $reply])
            @endforeach
        </div>
    @endif
</div>
