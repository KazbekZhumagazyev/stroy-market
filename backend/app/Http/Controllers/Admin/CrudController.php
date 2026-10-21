<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/** Общий CRUD для справочников админки: список с поиском и пагинацией, создание, изменение, удаление. */
abstract class CrudController extends Controller
{
    /** @var class-string<Model> */
    protected string $model;

    protected array $search = ['name'];

    protected array $with = [];

    abstract protected function rules(Request $request, ?Model $item): array;

    protected function query(Request $request): Builder
    {
        return $this->model::query()->with($this->with);
    }

    protected function present(Model $item): array
    {
        return $item->toArray();
    }

    protected function fill(Model $item, array $data): void
    {
        $item->fill($data)->save();
    }

    public function index(Request $request)
    {
        $q = $this->query($request);
        if ($term = trim((string) $request->input('q'))) {
            $like = '%'.mb_strtolower($term).'%';
            $q->where(fn ($w) => collect($this->search)->each(fn ($col) => $w->orWhereRaw("LOWER({$col}) LIKE ?", [$like])));
        }
        $page = $q->paginate(min(100, (int) $request->input('per_page', 20)));

        return [
            'data' => collect($page->items())->map(fn ($i) => $this->present($i)),
            'meta' => ['total' => $page->total(), 'page' => $page->currentPage(), 'last_page' => $page->lastPage()],
        ];
    }

    public function show(int $id)
    {
        return ['data' => $this->present($this->query(request())->findOrFail($id))];
    }

    public function store(Request $request)
    {
        $item = new $this->model;
        $this->fill($item, $request->validate($this->rules($request, null)));

        return response()->json(['data' => $this->present($item->fresh($this->with))], 201);
    }

    public function update(Request $request, int $id)
    {
        $item = $this->model::findOrFail($id);
        $this->fill($item, $request->validate($this->rules($request, $item)));

        return ['data' => $this->present($item->fresh($this->with))];
    }

    public function destroy(int $id)
    {
        $this->model::findOrFail($id)->delete();

        return ['ok' => true];
    }
}
