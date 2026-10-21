import { cn } from '@/lib/utils';

/**
 * Простая разметка для текстов из админки:
 * «## Заголовок», строки «- пункт» — список, пустая строка — новый абзац.
 */
export function RichText({ text, className }: { text: string | null | undefined; className?: string }) {
  if (!text) return null;
  const blocks = text.replace(/\r/g, '').split(/\n{2,}/);
  return (
    <div className={cn('space-y-3 text-[15px] leading-relaxed', className)}>
      {blocks.map((block, i) => {
        const lines = block.split('\n').filter((l) => l.trim());
        if (!lines.length) return null;
        const out: React.ReactNode[] = [];
        let items: string[] = [];
        const flush = () => {
          if (items.length) out.push(<ul key={out.length} className="list-disc space-y-1 pl-5">{items.map((t, k) => <li key={k}>{t}</li>)}</ul>);
          items = [];
        };
        for (const line of lines) {
          if (/^\s*[-•]\s+/.test(line)) items.push(line.replace(/^\s*[-•]\s+/, ''));
          else if (line.startsWith('## ')) { flush(); out.push(<h2 key={out.length} className="pt-2 text-xl font-bold text-ink">{line.slice(3)}</h2>); }
          else if (line.startsWith('### ')) { flush(); out.push(<h3 key={out.length} className="pt-1 text-lg font-semibold text-ink">{line.slice(4)}</h3>); }
          else { flush(); out.push(<p key={out.length}>{line}</p>); }
        }
        flush();
        return <div key={i} className="space-y-2">{out}</div>;
      })}
    </div>
  );
}
