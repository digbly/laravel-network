<?php

namespace Modules\Admin\Http\Controllers\Admin;

use App\Contracts\Setting as SettingContract;
use App\Contracts\ThemeSetting as ThemeSettingContract;
use App\Facades\PageBlock;
use App\Facades\PageTemplate;
use App\Facades\Sidebar;
use App\Facades\Widget;
use App\Http\Controllers\Controller;
use App\Models\Pages\Page;
use App\Models\Pages\PageBlock as PageBlockModel;
use App\Models\ThemeSidebar;
use App\Models\Website;
use App\Support\Customizes\Customize;
use App\Support\Customizes\CustomizeControl;
use App\Support\Customizes\CustomizeRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Modules\Admin\Http\Requests\Admin\Customize\SettingRequest;
use OpenApi\Attributes as OA;

class CustomizeController extends Controller
{
    #[OA\Get(
        path: '/api/v1/admin/websites/{website}/customize',
        summary: 'Customizer payload (panels, settings, pages and blocks)',
        operationId: 'customize.index',
        tags: ['Customize'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'website', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Customizer payload'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(Website $website, Request $request): JsonResponse
    {
        app()->setLocale($request->getPreferredLanguage(['en', 'vi']));

        $customize = new Customize;

        $customize->addSection('site_identity', [
            'title' => __('admin.customize.site_identity'),
            'priority' => 1,
        ]);

        $customize->addControl(new CustomizeControl('site_identity', [
            'label' => __('admin.customize.site_identity'),
            'section' => 'site_identity',
            'settings' => 'site_identity',
            'type' => 'site_identity',
        ]));

        $customize = app(CustomizeRegistry::class)->apply($customize);

        $panels = $this->buildPanels($customize);

        $homePageId = theme_setting('home_page');
        $homePageBlocks = $homePageId ? $this->pageBlocksPayload((string) $homePageId) : [];

        return response()->json([
            'data' => [
                'title' => __('admin.customize.site_identity'),
                'panels' => $panels,
                'settings' => [
                    'setting' => app(SettingContract::class)->all()->toArray(),
                    'theme_setting' => app(ThemeSettingContract::class)->all()->toArray(),
                ],
                'websiteId' => $website->id,
                'previewUrl' => $website->url,
                'pages' => $this->pagesPayload(),
                'pageTemplates' => $this->pageTemplatesPayload(),
                'availableBlocks' => $this->availableBlocksPayload(),
                'homePageBlocks' => $homePageBlocks,
                'theme' => theme_name(),
            ],
        ]);
    }

    #[OA\Post(
        path: '/api/v1/admin/websites/{website}/customize',
        summary: 'Persist customizer settings, homepage blocks and widgets',
        operationId: 'customize.update',
        tags: ['Customize'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'website', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(type: SettingRequest::class)
                ),
            ]
        ),
        responses: [
            new OA\Response(response: 200, description: 'Customizer saved'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(Website $website, SettingRequest $request): JsonResponse
    {
        $data = $request->validated();

        $globalSettings = $data['setting'] ?? [];
        $themeSettings = $data['theme_setting'] ?? [];
        $locale = $data['locale'] ?? app()->getLocale();

        $settings = app(SettingContract::class);
        $settings->locale($locale);
        $settings->sets($globalSettings);
        $settings->locale(app()->getLocale());

        app(ThemeSettingContract::class)->sets($themeSettings);

        $homePageId = $themeSettings['home_page'] ?? theme_setting('home_page');

        if ($homePageId && $request->has('blocks')) {
            $this->syncBlocks((string) $homePageId, $request->input('blocks', []), $locale);
        }

        if ($request->has('widgets')) {
            $this->syncWidgets($request->input('widgets', []), $locale);
        }

        return response()->json(['message' => __('admin.customize.notices.saved')]);
    }

    #[OA\Get(
        path: '/api/v1/admin/websites/{website}/customize/page-blocks/{page}',
        summary: 'List the blocks assigned to a page grouped by container',
        operationId: 'customize.pageBlocks',
        tags: ['Customize'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'website', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
            new OA\Parameter(name: 'page', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Page blocks'),
            new OA\Response(response: 404, description: 'Page not found'),
        ]
    )]
    public function pageBlocks(Website $website, string $page): JsonResponse
    {
        $model = Page::query()->findOrFail($page);

        return response()->json([
            'blocks' => $this->pageBlocksPayload($model->id),
            'template' => $model->template,
        ]);
    }

    #[OA\Get(
        path: '/api/v1/admin/websites/{website}/customize/widgets',
        summary: 'List widgets, sidebars and their assignments for the customizer',
        operationId: 'customize.widgets',
        tags: ['Customize'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'website', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Widget payload'),
        ]
    )]
    public function widgets(Website $website, Request $request): JsonResponse
    {
        app()->setLocale($request->getPreferredLanguage(['en', 'vi']));

        $sidebars = Sidebar::all()
            ->map(fn ($sidebar) => [
                'key' => $sidebar->getKey(),
                'label' => $sidebar->label,
                'description' => $sidebar->description,
            ])
            ->values();

        $widgets = Widget::all()
            ->map(fn ($widget) => [
                'key' => $widget->getKey(),
                'label' => $widget->label,
                'description' => $widget->description,
                'only' => $widget->only,
            ])
            ->values();

        $items = ThemeSidebar::query()
            ->with('translations')
            ->ordered()
            ->get();

        $sidebarWidgets = $sidebars->mapWithKeys(function (array $sidebar) use ($items) {
            $group = $items
                ->where('sidebar', $sidebar['key'])
                ->values()
                ->map(fn (ThemeSidebar $item) => [
                    'id' => $item->id,
                    'widget' => $item->widget,
                    'label' => $item->label ?: $item->widget,
                    'data' => $item->data ?? [],
                ]);

            return [$sidebar['key'] => $group];
        });

        return response()->json([
            'widgets' => $widgets,
            'sidebars' => $sidebars,
            'sidebarWidgets' => $sidebarWidgets,
            'locale' => app()->getLocale(),
            'theme' => theme_name(),
        ]);
    }

    /**
     * Nest sections and their controls under the registered panels.
     *
     * @return Collection<string, mixed>
     */
    protected function buildPanels(Customize $customize): Collection
    {
        $panels = $customize->getPanel()->sortBy('priority');

        foreach ($panels as $key => $panel) {
            $sections = $customize->getSection()->where('panel', $key);

            if ($sections->isEmpty()) {
                continue;
            }

            $childs = $panel->get('childs', new Collection([]));

            foreach ($sections as $secKey => $section) {
                $section->put('controls', $customize->getControl()->where('section', $secKey));
                $childs->put($secKey, $section);
            }

            $panel->put('childs', $childs);
        }

        foreach ($customize->getSection()->whereNull('panel') as $secKey => $section) {
            $section->put('controls', $customize->getControl()->where('section', $secKey));
            $panels->put($secKey, $section);
        }

        return $panels->values();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function pagesPayload(): array
    {
        return Page::query()
            ->with('translations')
            ->get()
            ->map(fn (Page $page) => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'template' => $page->template,
            ])
            ->toArray();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function pageTemplatesPayload(): array
    {
        return PageTemplate::all()
            ->map(fn ($template, $key) => [
                'key' => $key,
                'label' => $template->get('label'),
                'blocks' => $template->get('blocks') ?? [],
            ])
            ->values()
            ->toArray();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function availableBlocksPayload(): array
    {
        return PageBlock::all()
            ->map(fn ($block, $key) => [
                'key' => $key,
                'label' => $block->get('label'),
            ])
            ->values()
            ->toArray();
    }

    /**
     * @return array<string, array<int, array<string, mixed>>>
     */
    protected function pageBlocksPayload(string $pageId): array
    {
        $page = Page::query()->find($pageId);

        if ($page === null) {
            return [];
        }

        $formatted = [];

        $page->blocks()
            ->with('translations')
            ->orderBy('display_order')
            ->get()
            ->each(function (PageBlockModel $block) use (&$formatted): void {
                $formatted[$block->container][] = [
                    'id' => $block->id,
                    'block' => $block->block,
                    'label' => $block->label,
                    'data' => $block->data ?? [],
                ];
            });

        return $formatted;
    }

    /**
     * @param  array<string, mixed>  $blocks
     */
    protected function syncBlocks(string $pageId, array $blocks, string $locale): void
    {
        $page = Page::query()->find($pageId);

        if ($page === null) {
            return;
        }

        $keptIds = [];

        foreach ($blocks as $containerKey => $container) {
            if (! is_array($container)) {
                continue;
            }

            $items = isset($container['block']) ? [$container] : $container;
            $order = 1;

            foreach ($items as $content) {
                if (! is_array($content) || empty($content['block'])) {
                    continue;
                }

                if (PageBlock::get($content['block']) === null) {
                    continue;
                }

                $attributes = [
                    'container' => $content['container'] ?? $containerKey,
                    'block' => $content['block'],
                    'data' => $content['data'] ?? [],
                    'display_order' => $order,
                ];

                $block = ! empty($content['id'])
                    ? $page->blocks()->whereKey($content['id'])->first()
                    : null;

                if ($block !== null) {
                    $block->fill($attributes)->save();
                } else {
                    $block = $page->blocks()->create($attributes);
                }

                $translation = $block->translateOrNew($locale);
                $translation->label = $content['label'] ?? null;
                $translation->fields = $content['data'] ?? [];
                $block->save();

                $keptIds[] = $block->id;
                $order++;
            }
        }

        $page->blocks()
            ->whereNotIn('id', $keptIds)
            ->get()
            ->each
            ->delete();
    }

    /**
     * @param  array<string, mixed>  $widgets
     */
    protected function syncWidgets(array $widgets, string $locale): void
    {
        DB::transaction(function () use ($widgets, $locale): void {
            foreach ($widgets as $sidebarKey => $contents) {
                if (! is_array($contents)) {
                    continue;
                }

                if (Sidebar::get($sidebarKey) === null) {
                    continue;
                }

                $order = 1;
                $keptIds = [];

                foreach ($contents as $content) {
                    if (! is_array($content) || empty($content['widget'])) {
                        continue;
                    }

                    $widget = Widget::get($content['widget']);

                    if ($widget === null) {
                        continue;
                    }

                    $attributes = [
                        'sidebar' => $sidebarKey,
                        'widget' => $content['widget'],
                        'data' => $content['data'] ?? [],
                        'theme' => theme_name(),
                        'display_order' => $order,
                    ];

                    $existing = ! empty($content['id'])
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
                    ->whereSidebar($sidebarKey)
                    ->whereNotIn('id', $keptIds)
                    ->delete();
            }
        });
    }
}
