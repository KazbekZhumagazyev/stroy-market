'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Calculator, Link2, Mail, MessageCircle, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { QtyStepper } from '@/components/qty-stepper';
import { WishButton } from '@/components/wish-button';
import { fmt } from '@/lib/format';
import type { Product } from '@/lib/types';
import { useShop } from '@/lib/store';

export function ProductBuy({ p, calcTitle }: { p: Product; calcTitle: string }) {
  const [qty, setQty] = useState(1);
  const [area, setArea] = useState('');
  const [calcMsg, setCalcMsg] = useState<React.ReactNode>(null);
  const add = useShop((s) => s.add);
  const router = useRouter();

  const buy = () => {
    add(p, qty);
    toast.success('Добавлено в корзину', { description: `${p.name} · ${qty} ${p.unit}` });
  };

  const calc = () => {
    const v = parseFloat(area.replace(',', '.'));
    if (!(v > 0) || !p.calc) {
      setCalcMsg(<span className="text-warn">Введите значение больше нуля</span>);
      return;
    }
    const need = Math.ceil(v / p.calc.per_unit);
    setQty(need);
    setCalcMsg(<>Понадобится <b>{need} {p.unit}</b> на сумму <b>{fmt(need * p.price)}</b> — количество подставлено в заказ</>);
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: p.name, url: location.href });
      else {
        await navigator.clipboard.writeText(location.href);
        toast('Ссылка скопирована');
      }
    } catch {
      /* пользователь закрыл окно «Поделиться» */
    }
  };

  return (
    <>
      <div className="mt-6 grid grid-cols-[auto_1fr] gap-3 sm:grid-cols-[auto_1fr_auto_auto]">
        <QtyStepper size="lg" value={qty} onChange={setQty} />
        <button type="button" onClick={buy}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-5 font-semibold whitespace-nowrap text-white transition hover:bg-brand-dark active:scale-[0.98]">
          <ShoppingBag className="size-5 shrink-0" /> В корзину<span className="hidden sm:inline">· {fmt(p.price * qty)}</span>
        </button>
        <div className="col-span-2 flex gap-3 sm:contents">
          <button type="button" onClick={() => { add(p, qty); router.push('/cart'); }}
            className="h-12 flex-1 rounded-full bg-ink px-6 font-semibold whitespace-nowrap text-white transition hover:bg-black">
            Купить сейчас{qty > 1 && <span className="sm:hidden"> · {fmt(p.price * qty)}</span>}
          </button>
          <WishButton id={p.id} className="size-12 shrink-0 bg-secondary shadow-none" />
        </div>
      </div>

      {p.calc && (
        <div className="mt-6 rounded-2xl bg-sun/15 p-5 ring-1 ring-sun/40">
          <h3 className="flex items-center gap-2 font-semibold"><Calculator className="size-5" /> {calcTitle}</h3>
          <p className="mt-1 text-sm text-ink/70">{p.calc.hint}</p>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); calc(); }}>
            <input value={area} onChange={(e) => setArea(e.target.value)} inputMode="decimal" placeholder={p.calc.label} aria-label={p.calc.label}
              className="h-11 min-w-0 flex-1 rounded-full bg-white px-4 text-sm outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-ink" />
            <button className="h-11 shrink-0 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-black">Рассчитать</button>
          </form>
          {calcMsg && <p className="mt-3 text-sm">{calcMsg}</p>}
        </div>
      )}

      <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
        Поделиться:
        <a href={`https://wa.me/?text=${encodeURIComponent(p.name)}`} target="_blank" rel="noopener" aria-label="WhatsApp"
          className="grid size-9 place-items-center rounded-full bg-secondary hover:bg-[#25d366] hover:text-white">
          <MessageCircle className="size-4" />
        </a>
        <a href={`mailto:?subject=${encodeURIComponent(p.name)}`} aria-label="E-mail" className="grid size-9 place-items-center rounded-full bg-secondary hover:bg-ink hover:text-white">
          <Mail className="size-4" />
        </a>
        <button type="button" onClick={share} aria-label="Скопировать ссылку" className="grid size-9 place-items-center rounded-full bg-secondary hover:bg-ink hover:text-white">
          <Link2 className="size-4" />
        </button>
      </div>
    </>
  );
}
