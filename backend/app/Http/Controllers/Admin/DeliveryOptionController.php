<?php

namespace App\Http\Controllers\Admin;

use App\Models\DeliveryOption;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class DeliveryOptionController extends CrudController
{
    protected string $model = DeliveryOption::class;

    protected array $search = ['title'];

    protected function query(Request $request): Builder
    {
        return DeliveryOption::query()->orderBy('sort')->orderBy('id');
    }

    protected function rules(Request $request, ?Model $item): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'note' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:0'],
            'free_from' => ['nullable', 'integer', 'min:0'],
            'requires_address' => ['boolean'],
            'sort' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
