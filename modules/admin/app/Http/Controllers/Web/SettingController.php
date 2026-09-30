<?php

namespace Modules\Admin\Http\Controllers\Web;

use App\Support\AdminTranslations;
use Illuminate\Http\RedirectResponse;
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
        return Inertia::render('Admin::settings/Index', [
            'title' => __('admin.nav.settings'),
            'settings' => $this->payload(),
            'locales' => $translations->locales(),
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
}
