'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, X } from 'lucide-react';
import { productHref, waHref } from '@/lib/format';
import { clientApi, useSite } from '@/lib/site';
import type { ProductCard } from '@/lib/types';
import { ProductThumb } from './product-thumb';
import { SocialIcon } from './social-icon';

type Proof = { name: string; city: string; p: ProductCard; mins: number };

/** Всплывашка «Кто-то купил…» (имена из настроек, товары — популярные) и кнопка WhatsApp. */
export function Floating() {
  const { settings, apiUrl } = useSite();
  const { enabled, names } = settings.social_proof;
  const [proof, setProof] = useState<Proof | null>(null);
  const [show, setShow] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!enabled || !names.length || sessionStorage.getItem('sm_proof_off')) return;
    const pending = timers.current;
    let interval = 0;
    let i = Math.floor(Math.random() * names.length);
    clientApi<{ data: ProductCard[] }>(apiUrl, '/products?sort=popular&per_page=15').then(({ data }) => {
      if (!data.length) return;
      const next = () => {
        const { name, city } = names[i++ % names.length];
        setProof({ name, city, p: data[Math.floor(Math.random() * data.length)], mins: 3 + Math.floor(Math.random() * 55) });
        setShow(true);
        pending.push(window.setTimeout(() => setShow(false), 7000));
      };
      pending.push(window.setTimeout(next, 8000));
      interval = window.setInterval(next, 30000);
    }).catch(() => {});
    return () => {
      clearInterval(interval);
      pending.forEach(clearTimeout);
    };
  }, [enabled, names, apiUrl]);

  const off = () => {
    setShow(false);
    sessionStorage.setItem('sm_proof_off', '1');
    timers.current.forEach(clearTimeout);
  };

  return (
    <>
      <a href={waHref(settings.general.whatsapp)} target="_blank" rel="noopener" aria-label="Написать в WhatsApp"
        className="fixed right-4 bottom-20 z-30 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-lift transition hover:scale-105 md:right-6 md:bottom-6">
        <SocialIcon network="whatsapp" className="size-7" />
      </a>
      {proof && (
        <div aria-live="polite"
          className={`fixed bottom-20 left-4 z-30 flex w-[calc(100%-6rem)] max-w-sm items-center gap-3 rounded-2xl bg-white p-3 pr-9 shadow-lift ring-1 ring-black/5 transition-all duration-500 md:bottom-6 md:left-6 ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>
          <Link href={productHref(proof.p)} className="shrink-0"><ProductThumb p={proof.p} className="size-14 rounded-xl" iconClass="size-6" sizes="56px" /></Link>
          <div className="min-w-0 text-xs">
            <div><b>{proof.name}</b> <span className="text-muted-foreground">({proof.city}) купил(а)</span></div>
            <Link href={productHref(proof.p)} className="line-clamp-1 font-medium hover:text-brand">{proof.p.name}</Link>
            <div className="mt-0.5 text-muted-foreground">
              {proof.mins} мин назад · <span className="inline-flex items-center gap-0.5 text-success"><BadgeCheck className="size-3.5" /> Проверено</span>
            </div>
          </div>
          <button type="button" onClick={off} aria-label="Скрыть" className="absolute top-2 right-2 grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-secondary">
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
