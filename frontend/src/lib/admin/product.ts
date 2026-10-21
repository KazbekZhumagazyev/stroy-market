/** Данные товара из API админки → тело запроса на сохранение. */
export function toPayload(p: Record<string, unknown>) {
  const { id, created_at, updated_at, category, brand, bundle, discount, ...rest } = p;
  void id; void created_at; void updated_at; void category; void brand; void bundle; void discount;
  return { ...rest, images: ((p.images as ({ path: string } | string)[]) ?? []).map((i) => (typeof i === 'string' ? i : i.path)) };
}
