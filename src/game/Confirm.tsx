import { createContext, useContext, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";

type Request = { title: string; text: string; action: () => void; label?: string; danger?: boolean };
const Context = createContext<{ ask: (r: Request) => void; pending: boolean }>({ ask: () => {}, pending: false });
export const useGameConfirm = () => useContext(Context);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<Request | null>(null);
  return <Context.Provider value={{ ask: setRequest, pending: !!request }}>
    {children}
    <Dialog.Root open={!!request} onOpenChange={(open) => { if (!open) setRequest(null); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-ink/85" />
        <Dialog.Content className="pixel-panel fixed left-1/2 top-1/2 z-[81] w-[calc(100%-1rem)] max-w-md -translate-x-1/2 -translate-y-1/2 p-4">
          <Dialog.Title className="font-display text-base text-primary">{request?.title}</Dialog.Title>
          <Dialog.Description className="my-3 text-foreground">{request?.text}</Dialog.Description>
          <div className="grid grid-cols-2 gap-2">
            <Dialog.Cancel asChild><Button variant="secondary" className="pixel-btn h-11">Cancel</Button></Dialog.Cancel>
            <Dialog.Action asChild><Button className={`pixel-btn h-11 ${request?.danger ? "pixel-btn-danger" : "pixel-btn-primary"}`} onClick={() => { const r = request; setRequest(null); r?.action(); }}>{request?.label ?? "Confirm"}</Button></Dialog.Action>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </Context.Provider>;
}