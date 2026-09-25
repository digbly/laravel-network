<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ['token_type', 'expires_in', 'expires_at', 'access_token', 'refresh_token'],
    properties: [
        new OA\Property(
            property: 'token_type',
            type: 'string',
            example: 'Bearer'
        ),
        new OA\Property(
            property: 'expires_in',
            type: 'integer',
            example: 31536000
        ),
        new OA\Property(
            property: 'expires_at',
            type: 'string',
            format: 'date-time',
            example: '2027-08-16T09:00:00.000000Z'
        ),
        new OA\Property(
            property: 'access_token',
            type: 'string',
            example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...'
        ),
        new OA\Property(
            property: 'refresh_token',
            type: 'string',
            example: 'def50200...'
        ),
    ]
)]
class TokenResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'token_type' => $this->resource->token_type ?? 'Bearer',
            'expires_in' => $this->resource->expires_in ?? 0,
            'expires_at' => isset($this->resource->expires_in)
                ? now()->addSeconds((int) $this->resource->expires_in)->toISOString()
                : null,
            'access_token' => $this->resource->access_token ?? null,
            'refresh_token' => $this->resource->refresh_token ?? null,
        ];
    }
}
