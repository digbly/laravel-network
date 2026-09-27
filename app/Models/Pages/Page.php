<?php

namespace App\Models\Pages;

use App\Enums\PageStatus;
use App\Traits\Networkable;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Page extends Model implements TranslatableContract
{
    use HasUuids, Networkable, Translatable;

    protected $table = 'pages';

    protected $fillable = [
        'status',
        'template',
        'website_id',
    ];

    public array $translatedAttributes = [
        'title',
        'slug',
        'content',
        'description',
    ];

    protected $casts = [
        'status' => PageStatus::class,
    ];

    public static function home(): ?self
    {
        if ($homeId = theme_setting('home_page')) {
            return static::find($homeId);
        }

        return null;
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(PageBlock::class, 'page_id', 'id');
    }
}
