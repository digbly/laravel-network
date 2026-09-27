<?php

namespace Modules\Admin\Http\Controllers\Admin;

use App\Facades\MenuBox;
use App\Facades\NavMenu;
use App\Facades\Setting;
use App\Http\Controllers\Controller;
use App\Models\Menus\Menu;
use App\Models\Website;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Modules\Admin\Http\Requests\Admin\MenuRequest;
use Modules\Admin\Http\Resources\MenuResource;
use OpenApi\Attributes as OA;

class MenuController extends Controller
{
    #[OA\Get(
        path: '/api/v1/admin/websites/{website}/menus',
        summary: 'List Menus',
        operationId: 'menus.index',
        tags: ['Menus'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'website', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Menus list',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(type: MenuResource::class)
                        ),
                    ]
                )
            ),
        ]
    )]
    public function index(Website $website, Request $request): AnonymousResourceCollection
    {
        $menus = Menu::withDataItems()
            ->paginate($request->integer('per_page', 15));

        return MenuResource::collection($menus);
    }

    #[OA\Get(
        path: '/api/v1/admin/websites/{website}/menus/{id}',
        summary: 'Show Menu',
        operationId: 'menus.show',
        tags: ['Menus'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'website', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Menu detail',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: MenuResource::class),
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Menu not found'),
        ]
    )]
    public function show(Website $website, Menu $menu): MenuResource
    {
        return MenuResource::make(
            Menu::withDataItems()->findOrFail($menu->getKey())
        );
    }

    #[OA\Get(
        path: '/api/v1/admin/websites/{website}/menus/boxes',
        summary: 'List available menu boxes',
        operationId: 'menus.boxes',
        tags: ['Menus'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'website', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Menu boxes'),
        ]
    )]
    public function boxes(Website $website, Request $request): JsonResponse
    {
        app()->setLocale($request->getPreferredLanguage(['en', 'vi']));

        $boxes = MenuBox::all()
            ->map(fn (array $box, string $key) => [
                'key' => $key,
                'label' => $box['options']()['label'] ?? ucfirst($key),
            ])
            ->values();

        return response()->json(['data' => $boxes]);
    }

    #[OA\Get(
        path: '/api/v1/admin/websites/{website}/menus/boxes/{box}',
        summary: 'List items available for a menu box',
        operationId: 'menus.boxes.items',
        tags: ['Menus'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'website', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
            new OA\Parameter(name: 'box', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'q', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Menu box items'),
        ]
    )]
    public function boxItems(Website $website, string $box, Request $request): JsonResponse
    {
        app()->setLocale($request->getPreferredLanguage(['en', 'vi']));

        $definition = MenuBox::get($box);
        $class = $definition['class'] ?? null;

        if (! $class || ! class_exists($class)) {
            return response()->json(['results' => []]);
        }

        $field = $definition['options']()['field'] ?? 'name';
        $search = $request->string('q')->toString();
        $translatable = (new $class) instanceof TranslatableContract;

        $query = $class::query()->latest();

        if ($translatable) {
            $query->with('translations');

            if ($search !== '') {
                $query->whereHas(
                    'translations',
                    fn ($builder) => $builder->where($field, 'like', "%{$search}%")
                );
            }
        } elseif ($search !== '') {
            $query->where($field, 'like', "%{$search}%");
        }

        $results = $query->limit(20)->get()->map(fn ($item) => [
            'id' => $item->getKey(),
            'text' => (string) $item->{$field},
            'menuable_class' => get_class($item),
            'menuable_class_name' => class_basename($item),
        ]);

        return response()->json(['results' => $results]);
    }

    #[OA\Get(
        path: '/api/v1/admin/websites/{website}/menus/locations',
        summary: 'List menu locations',
        operationId: 'menus.locations',
        tags: ['Menus'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'website', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Menu locations'),
        ]
    )]
    public function locations(Website $website, Request $request): JsonResponse
    {
        app()->setLocale($request->getPreferredLanguage(['en', 'vi']));

        $locations = NavMenu::all()
            ->map(fn (array $nav, string $key) => [
                'key' => $key,
                'label' => $nav['label'] ?? ucfirst($key),
            ])
            ->values();

        return response()->json([
            'data' => $locations,
            'selected' => (array) Setting::get('nav_location', []),
        ]);
    }

    #[OA\Post(
        path: '/api/v1/admin/websites/{website}/menus',
        summary: 'Create Menu',
        operationId: 'menus.store',
        tags: ['Menus'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'website', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(type: MenuRequest::class)
                ),
            ]
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Menu created',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: MenuResource::class),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(Website $website, MenuRequest $request): MenuResource
    {
        $menu = Menu::create([
            'name' => $request->validated('name'),
            'website_id' => website_id(),
        ]);

        return MenuResource::make($menu);
    }

    #[OA\Put(
        path: '/api/v1/admin/websites/{website}/menus/{id}',
        summary: 'Update Menu',
        operationId: 'menus.update',
        tags: ['Menus'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'website', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(type: MenuRequest::class)
                ),
            ]
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Menu updated',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: MenuResource::class),
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Menu not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(Website $website, MenuRequest $request, Menu $menu): MenuResource
    {
        $items = json_decode($request->validated('content'), true, 512, JSON_THROW_ON_ERROR);
        $locale = $request->validated('locale') ?? app()->getLocale();

        DB::transaction(function () use ($menu, $request, $items, $locale) {
            $menu->update($request->only('name'));

            $keptIds = $this->syncItems($menu, $items, 1, $locale);

            $menu->items()
                ->where(
                    fn ($query) => $query->whereNotIn('id', $keptIds)
                        ->orWhereColumn('id', 'parent_id')
                )
                ->delete();

            if ($request->has('location')) {
                $this->syncLocations($menu, (array) $request->input('location', []));
            }
        });

        return MenuResource::make(
            Menu::withDataItems()->findOrFail($menu->getKey())
        );
    }

    #[OA\Delete(
        path: '/api/v1/admin/websites/{website}/menus/{id}',
        summary: 'Delete Menu',
        operationId: 'menus.destroy',
        tags: ['Menus'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'website', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Menu deleted'),
            new OA\Response(response: 404, description: 'Menu not found'),
        ]
    )]
    public function destroy(Website $website, Menu $menu): JsonResponse
    {
        $menu->delete();

        return response()->json(['message' => 'Menu deleted successfully.']);
    }

    /**
     * @return array<int, string>
     */
    protected function syncItems(
        Menu $menu,
        array $items,
        int $index,
        string $locale,
        ?string $parentId = null
    ): array {
        $keptIds = [];

        foreach ($items as $item) {
            $attributes = [
                'parent_id' => $parentId,
                'display_order' => $index,
                'target' => $item['target'] ?? '_self',
            ];

            if (isset($item['key'])) {
                $box = MenuBox::get($item['key']);

                $attributes['menuable_type'] = $box['class'] ?? ($item['menuable_type'] ?? null);
                $attributes['menuable_id'] = $item['menuable_id'] ?? null;
                $attributes['box_key'] = $item['key'];
            } else {
                $attributes['is_home'] = $item['is_home'] ?? 0;
                $attributes['link'] = $item['link'] ?? null;
                $attributes['box_key'] = 'custom';
            }

            $newItem = $menu->items()->updateOrCreate(
                ['id' => $item['id'] ?? null],
                $attributes
            );

            $newItem->translateOrNew($locale)->label = $item['label'] ?? '';
            $newItem->save();

            $keptIds[] = $newItem->id;

            if ($children = Arr::get($item, 'children')) {
                $keptIds = array_merge(
                    $keptIds,
                    $this->syncItems($menu, $children, 1, $locale, $newItem->id)
                );
            }

            $index++;
        }

        return $keptIds;
    }

    /**
     * Assign the menu to the given theme locations, detaching it from the
     * locations it no longer belongs to.
     *
     * @param  array<int, string>  $locations
     */
    protected function syncLocations(Menu $menu, array $locations): void
    {
        $config = (array) Setting::get('nav_location', []);

        foreach ($config as $key => $menuId) {
            if ((string) $menuId === (string) $menu->getKey()) {
                unset($config[$key]);
            }
        }

        foreach ($locations as $location) {
            $config[$location] = $menu->getKey();
        }

        Setting::set('nav_location', $config);
    }
}
