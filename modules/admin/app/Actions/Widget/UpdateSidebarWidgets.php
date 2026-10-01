<?php

namespace Modules\Admin\Actions\Widget;

use App\Facades\Sidebar;
use App\Facades\Widget;
use App\Models\ThemeSidebar;
use Illuminate\Support\Facades\DB;

/**
 * Sync the ordered widgets attached to a sidebar: update or create the entries
 * the builder kept, then delete the ones it dropped.
 */
class UpdateSidebarWidgets
{
    /**
     * @param  array<int, array<string, mixed>>  $contents
     */
    public function handle(string $sidebar, array $contents, string $locale, ?string $theme): void
    {
        if (Sidebar::get($sidebar) === null) {
            abort(404);
        }

        DB::transaction(function () use ($sidebar, $contents, $locale, $theme): void {
            $order = 1;
            $keptIds = [];

            foreach ($contents as $content) {
                $widgetKey = $content['widget'];
                $widget = Widget::get($widgetKey);

                if ($widget === null || ! $widget->supports($sidebar)) {
                    continue;
                }

                $attributes = [
                    'sidebar' => $sidebar,
                    'widget' => $widgetKey,
                    'data' => $content['data'] ?? [],
                    'theme' => $theme,
                    'display_order' => $order,
                ];

                $existing = isset($content['id'])
                    ? ThemeSidebar::query()->find($content['id'])
                    : null;

                if ($existing !== null) {
                    $existing->fill($attributes)->save();
                    $item = $existing;
                } else {
                    $item = ThemeSidebar::query()->create($attributes);
                }

                $item->translateOrNew($locale)->label = $content['label'] ?? $widget->label;
                $item->save();

                $keptIds[] = $item->id;
                $order++;
            }

            ThemeSidebar::query()
                ->whereSidebar($sidebar)
                ->whereNotIn('id', $keptIds)
                ->delete();
        });
    }
}
