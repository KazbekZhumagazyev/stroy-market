<?php

namespace App\Models\Concerns;

use App\Support\Frontend;

/** После любого изменения контента сбрасывает кеш страниц Next.js. */
trait RevalidatesFrontend
{
    protected static function bootRevalidatesFrontend(): void
    {
        static::saved(fn () => Frontend::revalidate());
        static::deleted(fn () => Frontend::revalidate());
    }
}
