'use client';

import { useState } from 'react';
import { LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { mutate as globalMutate } from 'swr';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ApiError, adminFetch, type ListResponse, useAdmin } from '@/lib/admin/client';
import type { Field } from '@/lib/admin/fields';
import { cn } from '@/lib/utils';
import { useConfirm } from './confirm';
import { SchemaForm } from './schema-form';
import { btn, Card, Empty, PageHeader, Pager, SearchInput, Skeleton, Table, td } from './ui';

export type Row = { id: number } & Record<string, unknown>;

export type ResourceConfig<T extends Row> = {
  endpoint: string;
  title: string;
  description?: string;
  addLabel?: string;
  columns: { label: string; render: (item: T) => React.ReactNode; className?: string }[];
  fields: Field[];
  defaults: Partial<T>;
  itemTitle: (item: T) => string;
  /** Поля, которые не отправляются на сервер (вычисляемые). */
  omit?: string[];
  wide?: boolean;
  deleteText?: (item: T) => string;
};

export function ResourceManager<T extends Row>({ config: c }: { config: ResourceConfig<T> }) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const key = `${c.endpoint}?page=${page}&q=${encodeURIComponent(q)}`;
  const { data, isLoading, mutate } = useAdmin<ListResponse<T>>(key);
  const [edit, setEdit] = useState<Partial<T> | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const confirm = useConfirm();

  const open = (item: Partial<T> | null) => {
    setErrors({});
    setEdit(item ? structuredClone(item) : { ...c.defaults });
  };

  async function save() {
    if (!edit) return;
    setBusy(true);
    setErrors({});
    const payload = Object.fromEntries(Object.entries(edit).filter(([k]) => !c.omit?.includes(k) && !['created_at', 'updated_at', 'id'].includes(k)));
    try {
      await adminFetch(edit.id ? `${c.endpoint}/${edit.id}` : c.endpoint, { method: edit.id ? 'PUT' : 'POST', json: payload });
      toast.success(edit.id ? 'Изменения сохранены' : 'Добавлено');
      setEdit(null);
      mutate();
      globalMutate('meta');
    } catch (e) {
      if (e instanceof ApiError) setErrors(e.errors);
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: T) {
    if (!(await confirm({ title: `Удалить «${c.itemTitle(item)}»?`, text: c.deleteText?.(item) ?? 'Действие нельзя отменить.' }))) return;
    try {
      await adminFetch(`${c.endpoint}/${item.id}`, { method: 'DELETE' });
      toast.success('Удалено');
      mutate();
      globalMutate('meta');
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <>
      <PageHeader title={c.title} description={c.description}
        actions={<button type="button" className={btn.primary} onClick={() => open(null)}><Plus className="size-4" /> {c.addLabel ?? 'Добавить'}</button>} />
      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} />
          {data && <span className="text-sm text-muted-foreground">Всего: {data.meta.total}</span>}
        </div>
        {isLoading && !data ? (
          <div className="space-y-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : (
          <Table head={[...c.columns.map((col) => col.label), '']} empty={!data?.data.length && <Empty text={q ? 'Ничего не найдено' : 'Пока пусто — добавьте первую запись'} />}>
            {data?.data.map((item) => (
              <tr key={item.id} className="cursor-pointer transition hover:bg-surface" onClick={() => open(item)}>
                {c.columns.map((col, i) => <td key={i} className={cn(td, col.className)}>{col.render(item)}</td>)}
                <td className={cn(td, 'w-24 text-right')} onClick={(e) => e.stopPropagation()}>
                  <div className="inline-flex gap-1">
                    <button type="button" aria-label="Изменить" onClick={() => open(item)} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-ink"><Pencil className="size-4" /></button>
                    <button type="button" aria-label="Удалить" onClick={() => remove(item)} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
        {data && <Pager page={data.meta.page} last={data.meta.last_page} onPage={setPage} />}
      </Card>

      <Sheet open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <SheetContent className={cn('w-full gap-0 bg-surface', c.wide ? 'sm:max-w-3xl' : 'sm:max-w-xl')}>
          <SheetHeader className="border-b bg-white p-5">
            <SheetTitle className="text-lg font-bold">{edit?.id ? c.itemTitle(edit as T) : c.addLabel ?? 'Новая запись'}</SheetTitle>
          </SheetHeader>
          <form id="resource-form" className="flex-1 overflow-y-auto p-5" onSubmit={(e) => { e.preventDefault(); save(); }}>
            {edit && <SchemaForm fields={c.fields} value={edit} onChange={setEdit} errors={errors} />}
          </form>
          <SheetFooter className="flex-row border-t bg-white p-4">
            <button type="button" className={cn(btn.light, 'flex-1')} onClick={() => setEdit(null)}>Отмена</button>
            <button form="resource-form" disabled={busy} className={cn(btn.primary, 'flex-[2]')}>
              {busy && <LoaderCircle className="size-4 animate-spin" />} Сохранить
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
