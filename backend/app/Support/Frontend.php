<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class Frontend
{
    private static bool $scheduled = false;

    /** Один запрос на ревалидацию после ответа, сколько бы моделей ни изменилось. */
    public static function revalidate(): void
    {
        $url = config('services.frontend.url');
        $secret = config('services.frontend.revalidate_secret');
        if (! $url || ! $secret || self::$scheduled || app()->runningInConsole()) {
            return;
        }
        self::$scheduled = true;
        app()->terminating(function () use ($url, $secret) {
            try {
                Http::timeout(3)->post(rtrim($url, '/').'/api/revalidate', ['secret' => $secret]);
            } catch (Throwable $e) {
                Log::warning('Frontend revalidate failed: '.$e->getMessage());
            }
        });
    }

    public static function storageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return str_starts_with($path, 'http') ? $path : rtrim(config('app.url'), '/').'/storage/'.ltrim($path, '/');
    }
}
