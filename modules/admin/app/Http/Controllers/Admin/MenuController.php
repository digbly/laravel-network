<?php

namespace Modules\Admin\Http\Controllers\Admin;

use App\Facades\MenuBox;
use App\Http\Controllers\Controller;
use App\Models\Menus\Menu;
use App\Models\Website;
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
}
