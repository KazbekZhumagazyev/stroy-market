'use client';

import { useEffect, useState } from 'react';

/** Таймер «Акций дня» до 23:59:59 текущего дня. */
export function Countdown({ label }: { label: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      setLeft(Math.max(0, end.getTime() - Date.now()));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  const parts = left == null ? ['--', '--', '--'] : [left / 3.6e6, (left / 6e4) % 60, (left / 1000) % 60].map((n) => String(Math.floor(n)).padStart(2, '0'));
  return (
    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <span className="hidden sm:inline">{label}</span>
      <span className="inline-flex items-center gap-1 font-mono text-sm font-bold tabular-nums">
        {parts.map((v, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-brand">:</span>}
            <span className="rounded-md bg-ink px-1.5 py-1 text-white">{v}</span>
          </span>
        ))}
      </span>
    </div>
  );
}
