"use client";

import { useEffect, useRef, useTransition } from "react";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { useToast } from "@/components/admin/toast";
import { buttonClass } from "@/components/admin/ui";
import { deleteMessageAction, setMessageReadAction } from "./actions";

/** Mesaj açıldığında okundu olarak işaretler (önceden getirmede tetiklenmemesi için istemcide). */
export function MarkReadOnOpen({ id, isRead }: { id: string; isRead: boolean }) {
  const done = useRef(false);
  useEffect(() => {
    if (isRead || done.current) return;
    done.current = true;
    void setMessageReadAction(id, true, true);
  }, [id, isRead]);
  return null;
}

export function ReadToggle({ id, isRead, size = "md" }: { id: string; isRead: boolean; size?: "sm" | "md" }) {
  const [pending, start] = useTransition();
  const push = useToast();
  return (
    <button
      type="button"
      disabled={pending}
      className={buttonClass("secondary", size)}
      onClick={() =>
        start(async () => {
          const res = await setMessageReadAction(id, !isRead);
          push(res.status === "error" ? "error" : "success", res.message ?? "");
        })
      }
    >
      {isRead ? "Okunmadı yap" : "Okundu yap"}
    </button>
  );
}

export function DeleteMessage({ id, backToList = false, size = "md" }: { id: string; backToList?: boolean; size?: "sm" | "md" }) {
  return (
    <ConfirmAction
      action={() => deleteMessageAction(id, backToList)}
      label="Sil"
      size={size}
      title="Mesaj silinsin mi?"
      message="Bu mesaj kalıcı olarak silinecek."
    />
  );
}
