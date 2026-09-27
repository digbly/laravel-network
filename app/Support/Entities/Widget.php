<?php

namespace App\Support\Entities;

use App\Models\ThemeSidebar;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Str;

class Widget
{
    public string $label;

    public ?string $description = null;

    public ?string $view = null;

    /**
     * Sidebar keys this widget may be attached to. An empty list allows any.
     *
     * @var array<int, string>
     */
    public array $only = [];

    /**
     * Default settings used to render the widget before it is configured.
     *
     * @var array<string, mixed>
     */
    public array $defaults = [];

    public function __construct(protected string $key, protected array $options = [])
    {
        $this->label = $options['label'] ?? Str::headline($key);
        $this->description = $options['description'] ?? null;
        $this->view = $options['view'] ?? null;
        $this->only = $options['only'] ?? [];
        $this->defaults = $options['defaults'] ?? [];
    }

    public function getKey(): string
    {
        return $this->key;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->{$key} ?? $default;
    }

    public function supports(string $sidebar): bool
    {
        return $this->only === [] || in_array($sidebar, $this->only, true);
    }

    public function render(ThemeSidebar $sidebar): View|string
    {
        if ($this->view === null) {
            return '';
        }

        return view($this->view, [
            'widget' => $this,
            'sidebar' => $sidebar,
            'data' => $sidebar->data ?? [],
        ]);
    }
}
