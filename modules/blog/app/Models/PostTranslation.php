<?php

namespace Modules\Blog\Models;

use App\Traits\HasNetworkWebsite;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostTranslation extends Model
{
    use HasNetworkWebsite;

    protected $table = 'post_translations';

    protected $fillable = [
        'title',
        'description',
        'content',
        'slug',
        'locale',
        'post_id',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'post_id');
    }
}
