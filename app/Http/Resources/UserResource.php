<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read User $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ['id', 'name', 'email', 'created_at', 'updated_at'],
    properties: [
        new OA\Property(
            property: 'id',
            type: 'string',
            format: 'uuid',
            example: '9c3c6f1a-6df7-4b1e-b8eb-9d8e6c7d9a10'
        ),
        new OA\Property(
            property: 'name',
            type: 'string',
            example: 'John Doe'
        ),
        new OA\Property(
            property: 'email',
            type: 'string',
            format: 'email',
            example: 'john@example.com'
        ),
        new OA\Property(
            property: 'role',
            type: 'string',
            enum: ['user', 'admin'],
            example: 'user'
        ),
        new OA\Property(
            property: 'email_verified_at',
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2026-08-16T09:00:00.000000Z'
        ),
        new OA\Property(
            property: 'created_at',
            type: 'string',
            format: 'date-time',
            example: '2026-08-16T09:00:00.000000Z'
        ),
        new OA\Property(
            property: 'updated_at',
            type: 'string',
            format: 'date-time',
            example: '2026-08-16T09:00:00.000000Z'
        ),
    ]
)]
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'email' => $this->resource->email,
            'role' => $this->resource->role,
            'email_verified_at' => $this->resource->email_verified_at?->toISOString(),
            'created_at' => $this->resource->created_at?->toISOString(),
            'updated_at' => $this->resource->updated_at?->toISOString(),
        ];
    }
}
