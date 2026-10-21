/** Типы ответов Laravel API. */

export type Category = {
  id: number;
  slug: string;
  name: string;
  icon: string;
  color: string;
  bg: string;
  image: string | null;
  description: string | null;
  show_in_menu: boolean;
  products_count?: number;
  seo_title: string | null;
  seo_description: string | null;
};

export type CategoryRef = Pick<Category, 'slug' | 'name' | 'icon' | 'color' | 'bg'>;

export type Badge = 'hot' | 'new' | 'sale';

export type ProductCard = {
  id: number;
  slug: string;
  sku: string | null;
  name: string;
  brand: string | null;
  category: CategoryRef;
  price: number;
  old_price: number | null;
  discount: number;
  unit: string;
  rating: number;
  sold: number;
  stock: number;
  badge: Badge | null;
  image: string | null;
};

export type Product = ProductCard & {
  images: string[];
  short_description: string | null;
  description: string | null;
  specs: { key: string; value: string }[];
  calc: { label: string; per_unit: number; hint: string } | null;
  seo_title: string | null;
  seo_description: string | null;
};

export type Review = {
  id: number;
  name: string;
  city: string | null;
  rating: number;
  text: string;
  product: { slug: string; name: string } | null;
};

export type Article = {
  id: number;
  slug: string;
  title: string;
  tag: string | null;
  cover: string | null;
  excerpt: string | null;
  body?: string | null;
  published_at: string | null;
  category: Category | null;
  seo_title: string | null;
  seo_description: string | null;
};

export type Page = {
  slug: string;
  title: string;
  lead: string | null;
  sections: { anchor?: string | null; title: string; body: string | null }[];
  seo_title: string | null;
  seo_description: string | null;
};

export type DeliveryOption = {
  id: number;
  title: string;
  note: string | null;
  price: number;
  free_from: number | null;
  requires_address: boolean;
};

export type Facets = {
  categories: { slug: string; name: string; count: number }[];
  brands: { slug: string; name: string; count: number }[];
  price: { min: number; max: number };
  sorts: { value: string; label: string }[];
};

export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; total: number; from: number | null; to: number | null; per_page: number };
};

export type Link = { label: string; href: string; icon?: string };
export type IconText = { icon: string; title: string; text: string };

export type Settings = {
  general: {
    brand: string;
    tagline: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    hours: string;
    rating: number;
    reviews_count: number;
    currency: string;
    socials: { network: string; url: string }[];
  };
  header: { topbar_links: Link[]; catalog_button: string; search_placeholder: string; sale_label: string };
  hero: {
    badge: string;
    title: string;
    title_accent: string;
    title_end: string;
    text: string;
    primary_label: string;
    primary_href: string;
    secondary_label: string;
    secondary_href: string;
    stats: { label: string; value: string }[];
    promo_main: { badge: string; title: string; text: string; link_label: string; href: string; icon: string };
    promo_cards: { title: string; text: string; href: string; icon: string; accent: string; style: 'sun' | 'white' | 'ink' | 'brand' }[];
  };
  home: {
    features: IconText[];
    categories_title: string;
    deals_title: string;
    deals_timer_label: string;
    hits_title: string;
    tabs_title: string;
    fresh_title: string;
    reviews_title: string;
    articles_title: string;
    show_brands: boolean;
    banner: { eyebrow: string; title: string; text: string; button_label: string; button_href: string };
  };
  product: {
    perks: IconText[];
    info_lines: { icon: string; text: string }[];
    default_description: string[];
    delivery_tab: string;
    bundle_title: string;
    bundle_text: string;
    calc_title: string;
    related_title: string;
  };
  cart: {
    bundle_discount_percent: number;
    low_stock: number;
    success_title: string;
    success_text: string;
    checkout_note: string;
    empty_text: string;
  };
  footer: {
    about: string;
    columns: { title: string; links: Link[] }[];
    copyright: string;
    note: string;
    subscribe_title: string;
    subscribe_text: string;
    subscribe_button: string;
    subscribe_success: string;
  };
  social_proof: { enabled: boolean; names: { name: string; city: string }[] };
  seo: { title: string; description: string };
};

export type HomeData = {
  categories: Category[];
  deals: ProductCard[];
  hits: ProductCard[];
  fresh: ProductCard[];
  tabs: { category: Category; products: ProductCard[] }[];
  reviews: Review[];
  articles: Article[];
  brands: { slug: string; name: string }[];
};

export type ProductPageData = {
  data: Product;
  bundle: ProductCard[];
  related: ProductCard[];
  reviews: Review[];
  reviews_count: number;
};
