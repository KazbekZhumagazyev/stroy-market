<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

/**
 * Все тексты и настройки сайта, которые редактируются в админке.
 * Хранятся в таблице settings по группам (ключ = группа, value = JSON).
 * Значения из БД накладываются поверх значений по умолчанию.
 */
class SiteSettings
{
    /** Группы, которые не отдаются в публичный API. */
    public const PRIVATE_GROUPS = ['notifications'];

    public static function defaults(): array
    {
        return [
            'general' => [
                'brand' => 'YGM IZOFLEX',
                'tagline' => 'Изоляционные и строительные материалы',
                'phone' => '+7 (700) 123-45-67',
                'whatsapp' => '77001234567',
                'email' => 'info@ygm-izoflex.kz',
                'address' => 'Алматы, ул. Строителей, 15',
                'hours' => 'Ежедневно 8:00–20:00',
                'rating' => 4.9,
                'reviews_count' => 196,
                'currency' => '₸',
                'socials' => [
                    ['network' => 'instagram', 'url' => 'https://instagram.com/'],
                    ['network' => 'whatsapp', 'url' => 'https://wa.me/77001234567'],
                    ['network' => 'telegram', 'url' => 'https://t.me/'],
                ],
            ],
            'header' => [
                'topbar_links' => [
                    ['label' => 'Доставка и оплата', 'href' => '/delivery', 'icon' => 'truck'],
                    ['label' => 'Для юрлиц', 'href' => '/b2b', 'icon' => 'building'],
                ],
                'catalog_button' => 'Каталог',
                'search_placeholder' => 'Цемент, гипсокартон, перфоратор…',
                'sale_label' => 'Акции',
            ],
            'hero' => [
                'badge' => 'Сезон стройки — скидки до 15%',
                'title' => 'Всё для стройки',
                'title_accent' => 'с доставкой',
                'title_end' => 'завтра',
                'text' => 'Утеплители, смеси, кровля и инструмент от Knauf, Rockwool, Ceresit, Bosch. Привезём манипулятором прямо на объект.',
                'primary_label' => 'Перейти в каталог',
                'primary_href' => '/catalog',
                'secondary_label' => 'Посчитать смету',
                'secondary_href' => 'tel:+77001234567',
                'stats' => [
                    ['label' => 'Рейтинг магазина', 'value' => '4.9'],
                    ['label' => 'Доставка', 'value' => '1 день'],
                    ['label' => 'Лет на рынке', 'value' => '8'],
                ],
                'promo_main' => [
                    'badge' => 'до −15%',
                    'title' => 'Утеплители и изоляция',
                    'text' => 'Rockwool, ТехноНИКОЛЬ, Knauf',
                    'link_label' => 'Смотреть',
                    'href' => '/catalog?sale=1',
                    'icon' => 'layers',
                ],
                'promo_cards' => [
                    ['title' => 'Доставка манипулятором', 'text' => 'Разгрузка поддонов на участок', 'href' => '/delivery', 'icon' => 'truck', 'accent' => '', 'style' => 'sun'],
                    ['title' => 'Скидка бригадам', 'text' => 'Персональные цены', 'href' => '/b2b', 'icon' => '', 'accent' => '−7%', 'style' => 'white'],
                ],
            ],
            'home' => [
                'features' => [
                    ['icon' => 'truck', 'title' => 'Доставка за 1 день', 'text' => 'По городу и области'],
                    ['icon' => 'calculator', 'title' => 'Расчёт материалов', 'text' => 'Бесплатно по смете'],
                    ['icon' => 'shield-check', 'title' => 'Гарантия качества', 'text' => 'Сертифицированный товар'],
                    ['icon' => 'credit-card', 'title' => 'Удобная оплата', 'text' => 'Kaspi, карта, безнал'],
                ],
                'categories_title' => 'Категории',
                'deals_title' => 'Акции дня',
                'deals_timer_label' => 'До конца акции',
                'hits_title' => 'Хиты продаж',
                'tabs_title' => 'Популярное по категориям',
                'fresh_title' => 'Новинки и рекомендуем',
                'reviews_title' => 'Отзывы покупателей',
                'articles_title' => 'Полезные статьи',
                'show_brands' => true,
                'banner' => [
                    'eyebrow' => 'Для частных домов и объектов',
                    'title' => 'Строите дом? Посчитаем смету бесплатно',
                    'text' => 'Пришлите проект — менеджер подберёт материалы и даст оптовую цену от 300 000 ₸.',
                    'button_label' => 'Заказать расчёт',
                    'button_href' => 'tel:+77001234567',
                ],
            ],
            'product' => [
                'perks' => [
                    ['icon' => 'zap', 'title' => 'Быстрая доставка', 'text' => 'В день заказа'],
                    ['icon' => 'badge-check', 'title' => 'Гарантия качества', 'text' => 'Сертификаты на товар'],
                    ['icon' => 'headset', 'title' => 'Поддержка', 'text' => 'Ежедневно 8:00–20:00'],
                ],
                'info_lines' => [
                    ['icon' => 'truck', 'text' => 'Доставка завтра от 3 000 ₸, бесплатно от 150 000 ₸'],
                    ['icon' => 'store', 'text' => 'Самовывоз сегодня со склада на ул. Строителей, 15'],
                    ['icon' => 'rotate-ccw', 'text' => 'Возврат целых упаковок в течение 14 дней'],
                ],
                'default_description' => [
                    'Сертифицированная продукция, хранение на крытом складе',
                    'Доставка на объект в день заказа или на следующий день',
                    'Расчёт количества и сметы — бесплатно',
                    'Безналичный расчёт с НДС для юридических лиц',
                ],
                'delivery_tab' => 'Доставляем бортовыми машинами и манипуляторами. Разгрузка поддонов, подъём на этаж — по запросу. Оплата: Kaspi, банковская карта, наличные, безналичный расчёт для юрлиц с НДС.',
                'bundle_title' => 'Купите вместе',
                'bundle_text' => 'Товары, которые обычно берут для этой работы',
                'calc_title' => 'Калькулятор расхода',
                'related_title' => 'Похожие товары',
            ],
            'cart' => [
                'bundle_discount_percent' => 5,
                'low_stock' => 50,
                'success_title' => 'Заказ №{number} оформлен',
                'success_text' => 'Менеджер свяжется с вами в течение 15 минут для подтверждения.',
                'checkout_note' => 'Менеджер перезвонит для подтверждения в течение 15 минут',
                'empty_text' => 'Добавьте товары из каталога — доставим уже завтра',
            ],
            'footer' => [
                'about' => 'Строительные и отделочные материалы с доставкой по городу и области. Работаем с частными клиентами и организациями.',
                'columns' => [
                    ['title' => 'Покупателям', 'links' => [
                        ['label' => 'Доставка и разгрузка', 'href' => '/delivery'],
                        ['label' => 'Оплата', 'href' => '/delivery#payment'],
                        ['label' => 'Возврат товара', 'href' => '/delivery#return'],
                        ['label' => 'Оптовым клиентам', 'href' => '/b2b'],
                        ['label' => 'Статьи', 'href' => '/blog'],
                    ]],
                ],
                'copyright' => '© {year} YGM IZOFLEX. Все права защищены.',
                'note' => 'Цены указаны в тенге с НДС',
                'subscribe_title' => 'Скидки для строителей и бригад',
                'subscribe_text' => 'Подпишитесь и получите промокод −5% на первый заказ',
                'subscribe_button' => 'Подписаться',
                'subscribe_success' => 'Спасибо! Промокод отправлен на почту',
            ],
            'social_proof' => [
                'enabled' => true,
                'names' => [
                    ['name' => 'Ерлан', 'city' => 'Алматы'],
                    ['name' => 'Айгерим', 'city' => 'Каскелен'],
                    ['name' => 'Данияр', 'city' => 'Талгар'],
                    ['name' => 'Бригада «Курылыс»', 'city' => 'Алматы'],
                ],
            ],
            'seo' => [
                'title' => 'YGM IZOFLEX — изоляция и строительные материалы в Алматы',
                'description' => 'Интернет-магазин изоляции и стройматериалов: утеплители, смеси, кровля, гипсокартон, инструмент. Доставка по Алматы и области за 1 день.',
            ],
            'notifications' => [
                'telegram_bot_token' => '',
                'telegram_chat_id' => '',
                'order_email' => '',
            ],
        ];
    }

    public static function all(): array
    {
        return Cache::rememberForever('site_settings', function () {
            $stored = Setting::pluck('value', 'key')->all();
            $result = [];
            foreach (self::defaults() as $group => $defaults) {
                $result[$group] = self::merge($defaults, $stored[$group] ?? []);
            }

            return $result;
        });
    }

    public static function public(): array
    {
        return Arr::except(self::all(), self::PRIVATE_GROUPS);
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return data_get(self::all(), $key, $default);
    }

    /** Сохраняет переданные группы целиком. Неизвестные группы игнорируются. */
    public static function update(array $groups): array
    {
        foreach (array_intersect_key($groups, self::defaults()) as $group => $value) {
            Setting::updateOrCreate(['key' => $group], ['value' => $value]);
        }
        Cache::forget('site_settings');

        return self::all();
    }

    /**
     * Ассоциативные массивы сливаются рекурсивно, списки (repeater) берутся из БД целиком —
     * чтобы удалённый в админке пункт не возвращался из значений по умолчанию.
     */
    private static function merge(array $defaults, array $stored): array
    {
        foreach ($stored as $key => $value) {
            if (is_array($value) && isset($defaults[$key]) && is_array($defaults[$key]) && ! array_is_list($defaults[$key]) && ! array_is_list($value)) {
                $defaults[$key] = self::merge($defaults[$key], $value);
            } else {
                $defaults[$key] = $value;
            }
        }

        return $defaults;
    }
}
