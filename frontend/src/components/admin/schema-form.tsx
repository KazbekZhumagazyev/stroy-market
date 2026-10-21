'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ImagePlus, LoaderCircle, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Icon, ICONS } from '@/components/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { storageUrl, uploadFile } from '@/lib/admin/client';
import { type Field, getPath, setPath } from '@/lib/admin/fields';
import { cn } from '@/lib/utils';

export const inputCls =
  'h-11 w-full rounded-xl border border-input bg-white px-3.5 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-ink focus:ring-3 focus:ring-ink/10 aria-invalid:border-destructive aria-invalid:ring-destructive/15';

type Errors = Record<string, string[] | undefined>;

/** Форма по описанию полей. value — объект, onChange получает новый объект. */
export function SchemaForm<T extends object>({ fields, value, onChange, errors = {}, prefix = '' }: {
  fields: Field[]; value: T; onChange: (v: T) => void; errors?: Errors; prefix?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5">
      {fields.map((f, i) => (
        <FieldView key={('key' in f ? f.key : f.label) + i} field={f} value={value} onChange={onChange} errors={errors} prefix={prefix} />
      ))}
    </div>
  );
}

function FieldView<T extends object>({ field: f, value, onChange, errors, prefix }: {
  field: Field; value: T; onChange: (v: T) => void; errors: Errors; prefix: string;
}) {
  if (f.type === 'heading') {
    return (
      <div className="col-span-2 border-b pb-2 first:pt-0 [&:not(:first-child)]:pt-4">
        <h3 className="font-semibold">{f.label}</h3>
        {f.hint && <p className="mt-0.5 text-xs text-muted-foreground">{f.hint}</p>}
      </div>
    );
  }
  if (f.type === 'group') {
    return (
      <fieldset className="col-span-2 rounded-2xl border bg-surface/60 p-4">
        <legend className="px-1 text-sm font-semibold">{f.label}</legend>
        {f.hint && <p className="mb-3 text-xs text-muted-foreground">{f.hint}</p>}
        <SchemaForm fields={f.fields} value={value} onChange={onChange} errors={errors} prefix={prefix} />
      </fieldset>
    );
  }

  const v = getPath(value, f.key);
  const set = (nv: unknown) => onChange(setPath(value, f.key, nv));
  const error = errors[prefix + f.key]?.[0];
  const half = 'half' in f && f.half;

  let control: React.ReactNode;
  switch (f.type) {
    case 'text':
    case 'email':
    case 'url':
    case 'password':
      control = <input type={f.type} className={inputCls} value={(v as string) ?? ''} placeholder={f.placeholder} required={f.required} aria-invalid={!!error}
        onChange={(e) => set(e.target.value)} />;
      break;
    case 'textarea':
      control = <textarea className={cn(inputCls, 'h-auto py-2.5 leading-relaxed')} rows={f.rows ?? 4} value={(v as string) ?? ''} placeholder={f.placeholder}
        required={f.required} aria-invalid={!!error} onChange={(e) => set(e.target.value)} />;
      break;
    case 'number':
      control = (
        <div className="relative">
          <input type="number" inputMode="decimal" step={f.step ?? 1} placeholder={f.placeholder} className={cn(inputCls, f.suffix && "pr-10")} value={v == null ? '' : String(v)} required={f.required}
            aria-invalid={!!error} onChange={(e) => set(e.target.value === '' ? null : Number(e.target.value))} />
          {f.suffix && <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-muted-foreground">{f.suffix}</span>}
        </div>
      );
      break;
    case 'switch':
      return (
        <label className={cn('flex cursor-pointer items-center justify-between gap-4 rounded-xl border bg-white px-4 py-3', half ? 'col-span-2 sm:col-span-1' : 'col-span-2')}>
          <span>
            <span className="text-sm font-medium">{f.label}</span>
            {f.hint && <span className="block text-xs text-muted-foreground">{f.hint}</span>}
          </span>
          <Switch checked={!!v} onCheckedChange={(c) => set(c)} />
        </label>
      );
    case 'select':
      control = (
        <div className="relative">
          <select className={cn(inputCls, 'appearance-none pr-9')} value={v == null ? '' : String(v)} required={f.required} aria-invalid={!!error}
            onChange={(e) => {
              const raw = e.target.value;
              const opt = f.options.find((o) => String(o.value) === raw);
              set(raw === '' ? null : opt ? opt.value : raw);
            }}>
            {(f.empty !== undefined || !f.required) && <option value="">{f.empty ?? '—'}</option>}
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      );
      break;
    case 'icon':
      control = <IconPicker value={(v as string) ?? ''} onChange={set} />;
      break;
    case 'color':
      control = (
        <div className="flex gap-2">
          <input type="color" value={(v as string) || '#000000'} onChange={(e) => set(e.target.value)}
            className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-input bg-white p-1" aria-label={f.label} />
          <input className={inputCls} value={(v as string) ?? ''} onChange={(e) => set(e.target.value)} placeholder="#000000" aria-invalid={!!error} />
        </div>
      );
      break;
    case 'image':
      control = <ImageField value={(v as string) ?? null} onChange={set} folder={f.folder} />;
      break;
    case 'date':
      control = <input type="datetime-local" className={inputCls} value={v ? String(v).slice(0, 16) : ''} onChange={(e) => set(e.target.value || null)} />;
      break;
    case 'list':
      control = <ListField value={(v as string[]) ?? []} onChange={set} placeholder={f.placeholder} />;
      break;
    case 'repeater':
      control = <Repeater field={f} value={(v as object[]) ?? []} onChange={set} errors={errors} prefix={`${prefix}${f.key}.`} />;
      break;
  }

  return (
    <div className={cn(half ? 'col-span-2 sm:col-span-1' : 'col-span-2', 'min-w-0')}>
      <label className="mb-1.5 block text-sm font-medium">
        {f.label}
        {'required' in f && f.required && <span className="text-brand"> *</span>}
      </label>
      {control}
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : 'hint' in f && f.hint ? <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p> : null}
    </div>
  );
}

function Repeater({ field, value, onChange, errors, prefix }: {
  field: Extract<Field, { type: 'repeater' }>; value: object[]; onChange: (v: object[]) => void; errors: Errors; prefix: string;
}) {
  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const empty = () => Object.fromEntries(field.fields.flatMap((f) => ('key' in f ? [[f.key.split('.')[0], f.type === 'repeater' || f.type === 'list' ? [] : f.type === 'switch' ? false : '']] : [])));
  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <div key={i} className="rounded-2xl border bg-surface/60 p-4">
          <div className="mb-3 flex items-center gap-1">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{field.itemLabel ?? 'Пункт'} {i + 1}</span>
            <div className="ml-auto flex gap-1">
              <IconBtn label="Выше" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="size-4" /></IconBtn>
              <IconBtn label="Ниже" disabled={i === value.length - 1} onClick={() => move(i, 1)}><ArrowDown className="size-4" /></IconBtn>
              <IconBtn label="Удалить" danger onClick={() => onChange(value.filter((_, k) => k !== i))}><Trash2 className="size-4" /></IconBtn>
            </div>
          </div>
          <SchemaForm fields={field.fields} value={item} errors={errors} prefix={`${prefix}${i}.`}
            onChange={(nv) => onChange(value.map((x, k) => (k === i ? nv : x)))} />
        </div>
      ))}
      {(!field.max || value.length < field.max) && (
        <button type="button" onClick={() => onChange([...value, empty()])}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-dashed border-ink/25 px-4 text-sm font-medium text-ink/70 transition hover:border-ink hover:text-ink">
          <Plus className="size-4" /> Добавить
        </button>
      )}
    </div>
  );
}

function ListField({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input className={inputCls} value={item} placeholder={placeholder} onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))} />
          <IconBtn label="Удалить" danger onClick={() => onChange(value.filter((_, k) => k !== i))} className="size-11"><X className="size-4" /></IconBtn>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, ''])}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-dashed border-ink/25 px-4 text-sm font-medium text-ink/70 hover:border-ink hover:text-ink">
        <Plus className="size-4" /> Добавить строку
      </button>
    </div>
  );
}

export function IconBtn({ label, onClick, disabled, danger, className, children }: {
  label: string; onClick: () => void; disabled?: boolean; danger?: boolean; className?: string; children: React.ReactNode;
}) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick}
      className={cn('grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-white hover:text-ink disabled:opacity-30',
        danger && 'hover:bg-destructive/10 hover:text-destructive', className)}>
      {children}
    </button>
  );
}

export function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = ICONS[value as keyof typeof ICONS];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<button type="button" className={cn(inputCls, 'flex items-center gap-2.5 text-left')} />}>
        {value ? <Icon name={value} className="size-5" /> : null}
        <span className="flex-1 truncate">{current?.label ?? 'Без иконки'}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-[22rem] p-3" align="start">
        <div className="grid max-h-72 grid-cols-6 gap-1 overflow-y-auto">
          {Object.entries(ICONS).map(([key, { label }]) => (
            <button key={key} type="button" title={label} onClick={() => { onChange(key); setOpen(false); }}
              className={cn('grid aspect-square place-items-center rounded-lg transition hover:bg-secondary', value === key && 'bg-ink text-white hover:bg-ink')}>
              <Icon name={key} className="size-5" />
            </button>
          ))}
        </div>
        <button type="button" onClick={() => { onChange(''); setOpen(false); }} className="mt-2 w-full rounded-lg py-1.5 text-xs text-muted-foreground hover:bg-secondary">
          Без иконки
        </button>
      </PopoverContent>
    </Popover>
  );
}

export function useUpload(folder: string) {
  const [busy, setBusy] = useState(false);
  const upload = async (files: FileList | File[]) => {
    setBusy(true);
    try {
      const out: string[] = [];
      for (const file of Array.from(files)) out.push((await uploadFile(file, folder)).path);
      return out;
    } catch (e) {
      toast.error((e as Error).message);
      return [];
    } finally {
      setBusy(false);
    }
  };
  return { busy, upload };
}

export function ImageField({ value, onChange, folder }: { value: string | null; onChange: (v: string | null) => void; folder: string }) {
  const input = useRef<HTMLInputElement>(null);
  const { busy, upload } = useUpload(folder);
  const url = storageUrl(value);
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => input.current?.click()}
        className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-dashed border-ink/25 bg-white text-muted-foreground transition hover:border-ink hover:text-ink">
        {busy ? <LoaderCircle className="size-6 animate-spin" /> : url ? <Image src={url} alt="" fill sizes="96px" className="object-cover" /> : <ImagePlus className="size-6" />}
      </button>
      <div className="flex flex-col items-start gap-1 text-sm">
        <button type="button" onClick={() => input.current?.click()} className="font-medium text-ink hover:text-brand">{url ? 'Заменить' : 'Загрузить фото'}</button>
        {url && <button type="button" onClick={() => onChange(null)} className="text-muted-foreground hover:text-destructive">Удалить</button>}
        <span className="text-xs text-muted-foreground">JPG, PNG, WebP до 8 МБ</span>
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={async (e) => {
        if (e.target.files?.length) {
          const [path] = await upload(e.target.files);
          if (path) onChange(path);
        }
        e.target.value = '';
      }} />
    </div>
  );
}
