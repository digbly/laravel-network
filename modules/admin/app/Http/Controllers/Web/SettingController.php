<?php

namespace Modules\Admin\Http\Controllers\Web;

use App\Http\Resources\MediaResource;
use App\Models\MediaItem;
use App\Support\AdminTranslations;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Admin\Http\Controllers\Admin\SettingController as AdminSettingController;
use Modules\Admin\Http\Requests\Admin\SettingRequest;

class SettingController extends AdminSettingController
{
    /**
     * Show the website settings form.
     */
    public function edit(AdminTranslations $translations): Response
    {
        $settings = $this->payload();

        return Inertia::render('Admin::settings/Index', [
            'title' => __('admin.nav.settings'),
            'settings' => $settings,
            'locales' => $translations->locales(),
            'media' => $this->mediaPreviews($settings),
        ]);
    }

    /**
     * Persist the submitted settings.
     */
    public function store(SettingRequest $request): RedirectResponse
    {
        $this->apply($request->validated());

        return back()->with('success', __('admin.settings.notices.saved'));
    }

    /**
     * Resolve the currently assigned branding media so the form can preview it.
     *
     * @param  array<string, mixed>  $settings
     * @return array<string, array<string, mixed>|null>
     */
    protected function mediaPreviews(array $settings): array
    {
        $ids = array_values(array_filter([
            $settings['logo'] ?? null,
            $settings['favicon'] ?? null,
            $settings['banner'] ?? null,
        ]));

        /** @var Collection<string, MediaItem> $items */
        $items = $ids === []
            ? collect()
            : MediaItem::query()->with('media')->whereIn('id', $ids)->get()->keyBy('id');

        $resolve = static function (?string $id) use ($items): ?array {
            $item = $id ? $items->get($id) : null;

            return $item ? MediaResource::make($item)->resolve() : null;
        };

        return [
            'logo' => $resolve($settings['logo'] ?? null),
            'favicon' => $resolve($settings['favicon'] ?? null),
            'banner' => $resolve($settings['banner'] ?? null),
        ];
    }
}
