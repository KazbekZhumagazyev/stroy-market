<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscriber;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    public function index(Request $request)
    {
        $q = Subscriber::latest('id');
        if ($term = trim((string) $request->input('q'))) {
            $q->where('email', 'like', '%'.mb_strtolower($term).'%');
        }
        $page = $q->paginate(50);

        return ['data' => $page->items(), 'meta' => ['total' => $page->total(), 'page' => $page->currentPage(), 'last_page' => $page->lastPage()]];
    }

    public function export()
    {
        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['email', 'created_at']);
            Subscriber::orderBy('id')->each(fn ($s) => fputcsv($out, [$s->email, $s->created_at]));
            fclose($out);
        }, 'subscribers.csv', ['Content-Type' => 'text/csv']);
    }

    public function destroy(int $id)
    {
        Subscriber::findOrFail($id)->delete();

        return ['ok' => true];
    }
}
