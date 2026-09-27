<?php

namespace App\Models;

use App\Traits\Networkable;
use Spatie\TranslationLoader\LanguageLine as BaseLanguageLine;

class LanguageLine extends BaseLanguageLine
{
    use Networkable;
}
