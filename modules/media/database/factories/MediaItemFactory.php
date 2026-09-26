<?php

namespace Modules\Media\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Media\Models\MediaItem;

class MediaItemFactory extends Factory
{
    protected $model = MediaItem::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->words(2, true),
            'alt' => $this->faker->sentence(),
            'caption' => null,
            'description' => null,
            'uploaded_by' => null,
        ];
    }
}
