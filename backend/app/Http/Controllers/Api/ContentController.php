<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Http\Resources\DeliveryOptionResource;
use App\Http\Resources\PageResource;
use App\Models\Article;
use App\Models\DeliveryOption;
use App\Models\Page;
use App\Models\Subscriber;
use App\Support\SiteSettings;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function settings()
    {
        return ['data' => SiteSettings::public()];
    }

    public function articles()
    {
        return ArticleResource::collection(Article::published()->with('category')->paginate(12));
    }

    public function article(string $slug)
    {
        return new ArticleResource(Article::published()->with('category')->where('slug', $slug)->firstOrFail());
    }

    public function page(string $slug)
    {
        return new PageResource(Page::where('is_published', true)->where('slug', $slug)->firstOrFail());
    }

    public function deliveryOptions()
    {
        return DeliveryOptionResource::collection(DeliveryOption::active()->get());
    }

    public function subscribe(Request $request)
    {
        $data = $request->validate(['email' => ['required', 'email:rfc', 'max:190']]);
        Subscriber::firstOrCreate(['email' => mb_strtolower($data['email'])]);

        return response()->json(['ok' => true], 201);
    }
}
