/** Описание полей для генератора форм админки. Путь `key` поддерживает точки: 'calc.per_unit'. */
export type Field =
  | { type: 'text' | 'email' | 'url' | 'password'; key: string; label: string; placeholder?: string; hint?: string; required?: boolean; half?: boolean }
  | { type: 'textarea'; key: string; label: string; rows?: number; placeholder?: string; hint?: string; required?: boolean }
  | { type: 'number'; key: string; label: string; suffix?: string; hint?: string; half?: boolean; step?: number; required?: boolean; placeholder?: string }
  | { type: 'switch'; key: string; label: string; hint?: string; half?: boolean }
  | { type: 'select'; key: string; label: string; options: { value: string | number; label: string }[]; empty?: string; hint?: string; half?: boolean; required?: boolean }
  | { type: 'icon'; key: string; label: string; half?: boolean }
  | { type: 'color'; key: string; label: string; half?: boolean }
  | { type: 'image'; key: string; label: string; folder: string; hint?: string; half?: boolean }
  | { type: 'date'; key: string; label: string; half?: boolean }
  | { type: 'list'; key: string; label: string; placeholder?: string; hint?: string }
  | { type: 'repeater'; key: string; label: string; fields: Field[]; itemLabel?: string; hint?: string; max?: number }
  | { type: 'group'; label: string; fields: Field[]; hint?: string }
  | { type: 'heading'; label: string; hint?: string };

export function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);
}

export function setPath<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split('.');
  const clone = (Array.isArray(obj) ? [...obj] : { ...(obj as object) }) as Record<string, unknown>;
  let cur = clone;
  keys.slice(0, -1).forEach((k) => {
    const next = cur[k];
    cur[k] = Array.isArray(next) ? [...next] : { ...((next as object) ?? {}) };
    cur = cur[k] as Record<string, unknown>;
  });
  cur[keys[keys.length - 1]] = value;
  return clone as T;
}
