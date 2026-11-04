"use client";

import { useId, useRef, useTransition, type ReactNode } from "react";
import type { ActionState } from "@/lib/admin/action-state";
import { Spinner } from "@/components/admin/admin-form";
import { useToast } from "@/components/admin/toast";
import { buttonClass, cx } from "@/components/admin/ui";

/**
 * Onay penceresi açan düğme. Onaylanınca Server Action'ı çağırır ve sonucu bildirir.
 * Silme gibi geri alınamaz işlemler için.
 */
export function ConfirmAction({
  action,
  label,
  title = "Emin misiniz?",
  message,
  confirmLabel = "Sil",
  variant = "danger",
  size = "sm",
  disabled,
  className,
  ariaLabel,
}: {
  action: () => Promise<ActionState | void>;
  label: ReactNode;
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  variant?: "danger" | "secondary" | "primary" | "ghost";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, start] = useTransition();
  const push = useToast();
  const titleId = useId();

  function confirm() {
    start(async () => {
      try {
        const res = await action();
        if (res?.status === "error") push("error", res.message ?? "İşlem başarısız oldu.");
        else if (res?.message) push("success", res.message);
      } catch (e) {
        // Yönlendirme (redirect) hataları Next tarafından ele alınır.
        if (e && typeof e === "object" && "digest" in e && String((e as { digest: unknown }).digest).startsWith("NEXT_")) throw e;
        push("error", "İşlem sırasında beklenmeyen bir hata oluştu.");
      } finally {
        ref.current?.close();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() => ref.current?.showModal()}
        className={cx(buttonClass(variant, size), className)}
        aria-label={ariaLabel}
      >
        {pending && <Spinner />}
        {label}
      </button>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-rule bg-white p-0 text-ink shadow-xl backdrop:bg-ink/40"
        onClick={(e) => {
          if (e.target === ref.current && !pending) ref.current?.close();
        }}
      >
        <div className="p-5">
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          <div className="mt-2 text-sm text-ink-2">{message}</div>
        </div>
        <div className="flex justify-end gap-2 border-t border-rule bg-paper/40 px-5 py-3">
          <button type="button" className={buttonClass("secondary")} onClick={() => ref.current?.close()} disabled={pending} autoFocus>
            Vazgeç
          </button>
          <button
            type="button"
            className={buttonClass(variant === "danger" ? "danger-solid" : variant === "ghost" ? "secondary" : variant)}
            onClick={confirm}
            disabled={pending}
          >
            {pending && <Spinner />}
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
