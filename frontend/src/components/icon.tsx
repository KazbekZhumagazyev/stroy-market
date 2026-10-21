import {
  BadgeCheck, BadgePercent, Box, BrickWall, Building2, Calculator, Clock, CreditCard, Droplets, Factory, Flame, Gift, Grid2x2,
  Hammer, Headset, Heart, House, Layers, Leaf, type LucideProps, MapPin, Nut, Package, PaintBucket, PaintRoller, PanelsTopLeft,
  Percent, Phone, Plug, Ruler, RotateCcw, Shield, ShieldCheck, ShoppingBag, Snowflake, Sparkles, Star, Store, Sun, ThumbsUp,
  Trees, Truck, Wallet, Warehouse, Wrench, Zap,
} from 'lucide-react';

/** Иконки, доступные для выбора в админке (ключ хранится в БД). */
export const ICONS = {
  package: { icon: Package, label: 'Коробка' },
  box: { icon: Box, label: 'Упаковка' },
  'paint-bucket': { icon: PaintBucket, label: 'Ведро / смеси' },
  'brick-wall': { icon: BrickWall, label: 'Кирпич' },
  trees: { icon: Trees, label: 'Дерево' },
  house: { icon: House, label: 'Дом / кровля' },
  layers: { icon: Layers, label: 'Слои / утеплитель' },
  panels: { icon: PanelsTopLeft, label: 'Панели / гипсокартон' },
  'paint-roller': { icon: PaintRoller, label: 'Валик / краска' },
  hammer: { icon: Hammer, label: 'Молоток' },
  wrench: { icon: Wrench, label: 'Ключ' },
  droplets: { icon: Droplets, label: 'Вода / сантехника' },
  zap: { icon: Zap, label: 'Молния / электрика' },
  plug: { icon: Plug, label: 'Вилка' },
  nut: { icon: Nut, label: 'Гайка / крепёж' },
  grid: { icon: Grid2x2, label: 'Плитка' },
  ruler: { icon: Ruler, label: 'Линейка' },
  snowflake: { icon: Snowflake, label: 'Снежинка / холод' },
  flame: { icon: Flame, label: 'Огонь' },
  sun: { icon: Sun, label: 'Солнце' },
  leaf: { icon: Leaf, label: 'Лист / эко' },
  factory: { icon: Factory, label: 'Завод' },
  warehouse: { icon: Warehouse, label: 'Склад' },
  store: { icon: Store, label: 'Магазин' },
  truck: { icon: Truck, label: 'Доставка' },
  calculator: { icon: Calculator, label: 'Калькулятор' },
  'shield-check': { icon: ShieldCheck, label: 'Гарантия' },
  shield: { icon: Shield, label: 'Щит' },
  'badge-check': { icon: BadgeCheck, label: 'Проверено' },
  'credit-card': { icon: CreditCard, label: 'Карта' },
  wallet: { icon: Wallet, label: 'Кошелёк' },
  percent: { icon: Percent, label: 'Процент' },
  'badge-percent': { icon: BadgePercent, label: 'Скидка' },
  gift: { icon: Gift, label: 'Подарок' },
  headset: { icon: Headset, label: 'Поддержка' },
  phone: { icon: Phone, label: 'Телефон' },
  clock: { icon: Clock, label: 'Часы' },
  'map-pin': { icon: MapPin, label: 'Адрес' },
  'rotate-ccw': { icon: RotateCcw, label: 'Возврат' },
  building: { icon: Building2, label: 'Компания' },
  star: { icon: Star, label: 'Звезда' },
  heart: { icon: Heart, label: 'Сердце' },
  'thumbs-up': { icon: ThumbsUp, label: 'Лайк' },
  sparkles: { icon: Sparkles, label: 'Новинка' },
  'shopping-bag': { icon: ShoppingBag, label: 'Покупки' },
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = (ICONS[name as IconName] ?? ICONS.package).icon;
  return <Cmp strokeWidth={1.7} {...props} />;
}
