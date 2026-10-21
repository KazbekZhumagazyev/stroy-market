import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Логотип YGM IZOFLEX: чёрные части берут currentColor, поэтому на тёмном фоне он белый. */
export function Logo({ className, brand = 'YGM IZOFLEX', caption }: { className?: string; brand?: string; caption?: string }) {
  return (
    <Link href="/" aria-label={`${brand} — на главную`} className={cn('flex shrink-0 items-center gap-3', className)}>
      <svg viewBox="0 0 150 64" role="img" aria-label={brand} className="h-10 w-auto md:h-11">
        <g fill="currentColor">
          <path d="M0 0H13L22 13L31 0H44L28 23V40H16V23Z" />
          <path d="M90 40V0H102L112 15L122 0H134V40H123V19L112 33L101 19V40Z" />
        </g>
        <path d="M87 5.5H62Q52.5 5.5 52.5 15V25Q52.5 34.5 62 34.5H81.5V21" fill="none" stroke="currentColor" strokeWidth="11" />
        <rect x="67" y="16" width="20" height="10" className="fill-brand" />
        <text x="0" y="63" textLength="134" lengthAdjust="spacingAndGlyphs" className="fill-brand font-logo" fontSize="24" fontWeight="900">
          IZOFLEX
        </text>
        <rect x="142" y="0" width="6" height="63" className="fill-brand" />
      </svg>
      {caption && <span className="hidden text-[11px] leading-tight font-medium uppercase tracking-wide opacity-60 lg:block max-w-[9.5rem]">{caption}</span>}
    </Link>
  );
}
