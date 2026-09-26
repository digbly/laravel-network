<?php

namespace Modules\Auth\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Modules\Auth\Http\Resources\RoleResource;
use OpenApi\Attributes as OA;

class RoleController extends Controller
{
    #[OA\Get(
        path: '/api/v1/admin/roles',
        summary: 'List Roles',
        operationId: 'admin.roles.index',
        tags: ['Admin Users'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Roles list',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(type: RoleResource::class)
                        ),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(): AnonymousResourceCollection
    {
        $roles = Role::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return RoleResource::collection($roles);
    }
}
