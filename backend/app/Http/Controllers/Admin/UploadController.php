<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\Frontend;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,avif,svg', 'max:8192'],
            'folder' => ['nullable', 'in:products,categories,brands,articles,misc'],
        ]);
        $path = $request->file('file')->store($data['folder'] ?? 'misc', 'public');

        return response()->json(['path' => $path, 'url' => Frontend::storageUrl($path)], 201);
    }
}
