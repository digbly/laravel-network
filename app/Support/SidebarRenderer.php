<?php

namespace App\Support;

use App\Contracts\Widget as WidgetContract;
use App\Models\ThemeSidebar;
use Illuminate\Support\Collection;

class SidebarRenderer
{
    public function __construct(protected WidgetContract $widgets) {}

    /**
     * Render the widgets attached to a sidebar for the active theme.
     *
     * When nothing has been configured yet, every widget registered for the
     * sidebar is rendered with its default settings so the theme keeps working
     * out of the box.
     *
     * @return array<int, array{key: string, label: string, html: string}>
     */
    public function render(string $sidebar, ?string $theme = null): array
    {
        $theme ??= theme_name();

        $items = $this->configured($sidebar, $theme);

        if ($items->isEmpty()) {
            $items = $this->defaults($sidebar);
        }

        return $items
            ->map(function (ThemeSidebar $item) {
                $widget = $this->widgets->get($item->widget);

                if ($widget === null) {
                    return null;
                }

                return [
                    'key' => $item->widget,
                    'label' => $item->label ?: $widget->label,
                    'html' => $widget->render($item)->render(),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    /**
     * Resolve the widgets attached to a sidebar into frontend data instead of
     * rendered HTML, for Inertia powered themes.
     *
     * @return array<int, array{key: string, label: string, component: string|null, data: array<string, mixed>}>
     */
    public function payload(string $sidebar, ?string $theme = null): array
    {
        $theme ??= theme_name();

        $items = $this->configured($sidebar, $theme);

        if ($items->isEmpty()) {
            $items = $this->defaults($sidebar);
        }

        return $items
            ->map(function (ThemeSidebar $item) {
                $widget = $this->widgets->get($item->widget);

                if ($widget === null || $widget->component === null) {
                    return null;
                }

                return $widget->resolve($item);
            })
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @return Collection<int, ThemeSidebar>
     */
    protected function configured(string $sidebar, ?string $theme): Collection
    {
        return ThemeSidebar::query()
            ->whereSidebar($sidebar)
            ->when(
                $theme !== null,
                fn ($query) => $query->where(
                    fn ($query) => $query->where('theme', $theme)->orWhereNull('theme')
                )
            )
            ->with('translations')
            ->ordered()
            ->get();
    }

    /**
     * @return Collection<int, ThemeSidebar>
     */
    protected function defaults(string $sidebar): Collection
    {
        return $this->widgets->all()
            ->filter(fn ($widget) => $widget->supports($sidebar)
                && ($widget->view !== null || $widget->component !== null))
            ->map(function ($widget) use ($sidebar) {
                $item = new ThemeSidebar([
                    'widget' => $widget->getKey(),
                    'sidebar' => $sidebar,
                    'data' => $widget->defaults,
                ]);
                $item->label = $widget->label;

                return $item;
            });
    }
}
