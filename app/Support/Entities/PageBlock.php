<?php

namespace App\Support\Entities;

use App\Models\Pages\PageBlock as PageBlockModel;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Str;

class PageBlock
{
    public string $label;

    public ?string $form = null;

    public ?string $view = null;

    public function __construct(public string $key, protected array $options = [])
    {
        $this->label = $options['label'] ?? Str::headline($key);
        $this->form = $options['form'] ?? null;
        $this->view = $options['view'] ?? null;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->{$key} ?? $default;
    }

    public function form(array $data = []): ?View
    {
        if ($this->form === null || ! view()->exists($this->form)) {
            return null;
        }

        return view($this->form, [
            'name' => $data['name'] ?? null,
            'data' => $data,
        ]);
    }

    public function view(PageBlockModel $block): ?View
    {
        if ($this->view === null || ! view()->exists($this->view)) {
            return null;
        }

        return view($this->view, ['block' => $block]);
    }
}
