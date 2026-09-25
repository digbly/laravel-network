<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ['token', 'user'],
    properties: [
        new OA\Property(
            property: 'token',
            type: TokenResource::class
        ),
        new OA\Property(
            property: 'user',
            type: UserResource::class
        ),
    ]
)]
class AuthResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'token' => TokenResource::make($this->resource['token']),
            'user' => UserResource::make($this->resource['user']),
        ];
    }
}
