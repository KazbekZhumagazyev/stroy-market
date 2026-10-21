'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

type Options = { title: string; text?: string; confirm?: string; danger?: boolean };
const ConfirmContext = createContext<(o: Options) => Promise<boolean>>(async () => false);

/** const confirm = useConfirm(); if (await confirm({ title: 'Удалить?' })) … */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<Options | null>(null);
  const resolver = useRef<(v: boolean) => void>(undefined);

  const confirm = useCallback((o: Options) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => (resolver.current = resolve));
  }, []);

  const close = (v: boolean) => {
    resolver.current?.(v);
    setOpts(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog.Root open={!!opts} onOpenChange={(o) => !o && close(false)}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-lift transition data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <AlertDialog.Title className="text-lg font-bold">{opts?.title}</AlertDialog.Title>
            {opts?.text && <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">{opts.text}</AlertDialog.Description>}
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => close(false)} className="h-11 flex-1 rounded-full bg-secondary font-medium hover:bg-border">Отмена</button>
              <button type="button" onClick={() => close(true)}
                className={`h-11 flex-1 rounded-full font-semibold text-white ${opts?.danger === false ? 'bg-ink hover:bg-black' : 'bg-destructive hover:bg-destructive/90'}`}>
                {opts?.confirm ?? 'Удалить'}
              </button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
