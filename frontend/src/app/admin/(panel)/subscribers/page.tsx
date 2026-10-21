'use client';


import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/admin/confirm';
import { btn, Card, Empty, PageHeader, Pager, SearchInput, Skeleton, Table, td } from '@/components/admin/ui';
import { adminFetch, type ListResponse, useAdmin } from '@/lib/admin/client';
import { dateTime } from '@/lib/admin/format';

type Sub = { id: number; email: string; created_at: string };

export default function SubscribersPage() {
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, mutate } = useAdmin<ListResponse<Sub>>(`subscribers?page=${page}&q=${encodeURIComponent(q)}`);

  const remove = async (s: Sub) => {
    if (!(await confirm({ title: `Удалить ${s.email}?` }))) return;
    await adminFetch(`subscribers/${s.id}`, { method: 'DELETE' }).then(() => toast.success('Удалено')).catch((e) => toast.error(e.message));
    mutate();
  };

  return (
    <>
      <PageHeader title="Подписчики" description="E-mail из формы «Скидки для строителей» в подвале сайта"
        actions={<a href="/admin-api/subscribers/export" download className={btn.light}><Download className="size-4" /> Скачать CSV</a>} />
      <Card>
        <div className="mb-4 flex items-center gap-3">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Поиск по e-mail" />
          {data && <span className="text-sm text-muted-foreground">Всего: {data.meta.total}</span>}
        </div>
        {isLoading && !data ? <Skeleton className="h-40" /> : (
          <Table head={['E-mail', 'Дата подписки', '']} empty={!data?.data.length && <Empty text="Подписчиков пока нет" />}>
            {data?.data.map((s) => (
              <tr key={s.id}>
                <td className={td}><a href={`mailto:${s.email}`} className="font-medium hover:text-brand">{s.email}</a></td>
                <td className={`${td} text-muted-foreground`}>{dateTime(s.created_at)}</td>
                <td className={`${td} text-right`}>
                  <button type="button" aria-label="Удалить" onClick={() => remove(s)} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button>
                </td>
              </tr>
            ))}
          </Table>
        )}
        {data && <Pager page={data.meta.page} last={data.meta.last_page} onPage={setPage} />}
      </Card>
    </>
  );
}
