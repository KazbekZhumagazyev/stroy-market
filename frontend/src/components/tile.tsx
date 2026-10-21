import { cn } from '@/lib/utils';

/** Плитка в цвете категории — фон под иконку или фото. */
export function tileStyle(c: { bg: string; color: string }) {
  return { '--tile-bg': c.bg, '--tile-fg': c.color } as React.CSSProperties;
}

export function Tile({ c, className, children }: { c: { bg: string; color: string }; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('tile relative flex items-center justify-center overflow-hidden', className)} style={tileStyle(c)}>
      {children}
    </div>
  );
}
