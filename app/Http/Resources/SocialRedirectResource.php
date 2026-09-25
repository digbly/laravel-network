<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ['redirect_url', 'provider'],
    properties: [
        new OA\Property(
            property: 'redirect_url',
            type: 'string',
            example: 'https://accounts.google.com/o/oauth2/auth...'
        ),
        new OA\Property(
            property: 'provider',
            type: 'string',
            example: 'google'
        ),
    ]
)]
class SocialRedirectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'redirect_url' => $this->resource['redirect_url'],
            'provider' => $this->resource['provider'],
        ];
    }
}
