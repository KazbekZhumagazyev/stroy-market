<?php

namespace App\Support;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/** Уведомление менеджера о новом заказе: Telegram и/или e-mail из настроек. */
class OrderNotifier
{
    public static function send(Order $order): void
    {
        $n = SiteSettings::get('notifications', []);
        $text = self::text($order);

        try {
            if (! empty($n['telegram_bot_token']) && ! empty($n['telegram_chat_id'])) {
                Http::timeout(5)->post("https://api.telegram.org/bot{$n['telegram_bot_token']}/sendMessage", [
                    'chat_id' => $n['telegram_chat_id'],
                    'text' => $text,
                ]);
            }
            if (! empty($n['order_email'])) {
                Mail::raw($text, fn ($m) => $m->to($n['order_email'])->subject("Новый заказ №{$order->number}"));
            }
        } catch (Throwable $e) {
            Log::warning("Order {$order->number} notify failed: ".$e->getMessage());
        }
    }

    private static function text(Order $order): string
    {
        $fmt = fn (int $n) => number_format($n, 0, ',', ' ').' ₸';
        $lines = ["🛒 Новый заказ №{$order->number}", '', "👤 {$order->customer_name}", "📞 {$order->phone}"];
        if ($order->address) {
            $lines[] = "📍 {$order->address}";
        }
        $lines[] = "🚚 {$order->delivery_title} — ".($order->delivery_price ? $fmt($order->delivery_price) : 'бесплатно');
        if ($order->comment) {
            $lines[] = "💬 {$order->comment}";
        }
        $lines[] = '';
        foreach ($order->items as $item) {
            $lines[] = "• {$item->name} — {$item->qty} {$item->unit} × {$fmt($item->price)}";
        }
        if ($order->bundle_discount) {
            $lines[] = 'Скидка за комплект: −'.$fmt($order->bundle_discount);
        }
        $lines[] = '';
        $lines[] = 'Итого: '.$fmt($order->total);

        return implode("\n", $lines);
    }
}
