<?php

namespace Modules\Admin\Http\Controllers\Admin;

use App\Facades\Sidebar;
use App\Facades\Widget;
use App\Http\Controllers\Controller;
use App\Models\ThemeSidebar;
use App\Models\Website;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\Admin\Http\Requests\Admin\WidgetUpdateRequest;
use Modules\Admin\Http\Resources\SidebarResource;
use Modules\Admin\Http\Resources\SidebarWidgetResource;
use Modules\Admin\Http\Resources\WidgetResource;
use OpenApi\Attributes as OA;

class WidgetController extends Controller
{
    #[OA\Get(
        path: '/api/v1/admin/websites/{website}/widgets',
        summary: 'List available widgets, sidebars and the widgets attached to each sidebar',
        operationId: 'widgets.index',
        tags: ['Widgets'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'website', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Widget index payload'),
        ]
    )]
    public function index(Website $website, Request $request): JsonResponse
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
                ->map(fn (ThemeSidebar $item) => SidebarWidgetResource::make($item)->resolve());

            return [$sidebar['key'] => $group];
        });

        return response()->json([
            'data' => [
                'widgets' => WidgetResource::collection($widgets)->resolve(),
                'sidebars' => SidebarResource::collection($sidebars)->resolve(),
                'sidebar_widgets' => $sidebarWidgets,
                'locale' => app()->getLocale(),
                'theme' => theme_name(),
            ],
        ]);
    }

    #[OA\Put(
        path: '/api/v1/admin/websites/{website}/widgets/{sidebar}',
        summary: 'Sync the widgets attached to a sidebar',
        operationId: 'widgets.update',
        tags: ['Widgets'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'website', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
            new OA\Parameter(name: 'sidebar', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(type: WidgetUpdateRequest::class)
                ),
            ]
        ),
        responses: [
            new OA\Response(response: 200, description: 'Sidebar saved'),
            new OA\Response(response: 404, description: 'Sidebar not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(Website $website, WidgetUpdateRequest $request, string $sidebar): JsonResponse
    {
        if (Sidebar::get($sidebar) === null) {
            abort(404);
        }

        $locale = $request->validated('locale') ?? app()->getLocale();
        $theme = theme_name();
        $contents = $request->input('content', []);

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

        return response()->json([
            'message' => __('admin.widgets.notices.saved'),
        ]);
    }
}
