<?php

namespace App\Models;

use App\Models\Concerns\RevalidatesFrontend;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['key', 'value'])]
class Setting extends Model
{
    use RevalidatesFrontend;

    protected function casts(): array
    {
        return ['value' => 'array'];
    }
}
