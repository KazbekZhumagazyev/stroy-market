<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

/** Генерирует уникальный латинский slug из названия, если он не задан вручную. */
trait HasSlug
{
    protected static function bootHasSlug(): void
    {
        static::saving(function ($model) {
            $source = $model->slug ?: $model->{$model->slugSource ?? 'name'};
            $base = Str::slug($source, '-', 'ru') ?: Str::lower(Str::random(8));
            $slug = $base;
            $i = 2;
            while (static::where('slug', $slug)->whereKeyNot($model->getKey())->exists()) {
                $slug = "{$base}-".$i++;
            }
            $model->slug = $slug;
        });
    }
}
