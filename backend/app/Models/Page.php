<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use App\Models\Concerns\RevalidatesFrontend;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'slug', 'lead', 'sections', 'is_published', 'seo_title', 'seo_description'])]
class Page extends Model
{
    use HasSlug, RevalidatesFrontend;

    protected string $slugSource = 'title';

    protected function casts(): array
    {
        return ['sections' => 'array', 'is_published' => 'boolean'];
    }
}
