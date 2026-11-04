"use client";

import {
  createContext,
  startTransition,
  use,
  useActionState,
  useEffect,
  useRef,
  type FormEvent,
  type ReactNode,
} from "react";
import { IDLE, type ActionState, type FieldErrors } from "@/lib/admin/action-state";
import { useToast } from "@/components/admin/toast";
import { buttonClass, cx, Notice } from "@/components/admin/ui";

type ServerAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

const ErrorsContext = createContext<FieldErrors>({});

/** Alan bileşenleri hata mesajını bu kancayla okur. */
export function useFieldError(name: string | undefined) {
  const errors = use(ErrorsContext);
  return name ? errors[name] : undefined;
}

/**
 * useActionState tabanlı form. Gönderimde sayfayı yenilemez ve React'in
 * otomatik form sıfırlamasını engeller (hata olduğunda girilenler kaybolmaz).
 */
export function AdminForm({
  action,
  children,
  submitLabel = "Kaydet",
  pendingLabel = "Kaydediliyor…",
  resetOnSuccess = false,
  className,
  footer,
  footerClassName,
  hideSubmit = false,
  toast = true,
  onSuccess,
  "aria-label": ariaLabel,
}: {
  action: ServerAction;
  children: ReactNode;
  submitLabel?: string;
  pendingLabel?: string;
  resetOnSuccess?: boolean;
  className?: string;
  /** Kaydet düğmesinin yanında gösterilecek ek öğeler. */
  footer?: ReactNode;
  footerClassName?: string;
  hideSubmit?: boolean;
  toast?: boolean;
  onSuccess?: (state: ActionState) => void;
  "aria-label"?: string;
}) {
  const [state, formAction, pending] = useActionState(action, IDLE);
  const formRef = useRef<HTMLFormElement>(null);
  const push = useToast();
  const lastAt = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!state.at || state.at === lastAt.current) return;
    lastAt.current = state.at;
    if (state.status === "success") {
      if (toast && state.message) push("success", state.message);
      if (resetOnSuccess) formRef.current?.reset();
      onSuccess?.(state);
    } else if (state.status === "error") {
      if (toast && state.message) push("error", state.message);
      // İlk hatalı alana odaklan
      const first = state.errors && Object.keys(state.errors)[0];
      if (first && formRef.current) {
        const el = formRef.current.querySelector<HTMLElement>(`[name="${CSS.escape(first)}"]`);
        el?.focus();
      }
    }
  }, [state, push, resetOnSuccess, toast, onSuccess]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const fd = new FormData(e.currentTarget, submitter);
    startTransition(() => formAction(fd));
  }

  return (
    <ErrorsContext value={state.status === "error" ? (state.errors ?? {}) : {}}>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={onSubmit}
        className={className}
        aria-label={ariaLabel}
        aria-busy={pending}
        noValidate
      >
        <fieldset disabled={pending} className="contents">
          {children}
        </fieldset>
        {state.status === "error" && state.message && (
          <Notice tone="error" className="mt-4">
            {state.message}
          </Notice>
        )}
        {!hideSubmit && (
          <div className={cx("mt-5 flex flex-wrap items-center gap-3", footerClassName)}>
            <SubmitButton pending={pending} label={submitLabel} pendingLabel={pendingLabel} />
            {footer}
            {state.status === "success" && state.message && !pending && (
              <span role="status" className="text-sm text-emerald-700">
                ✓ {state.message}
              </span>
            )}
          </div>
        )}
      </form>
    </ErrorsContext>
  );
}

export function SubmitButton({
  pending,
  label = "Kaydet",
  pendingLabel = "Kaydediliyor…",
  variant = "primary",
  size,
  className,
}: {
  pending: boolean;
  label?: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <button type="submit" disabled={pending} className={cx(buttonClass(variant, size), className)} aria-live="polite">
      {pending && <Spinner />}
      {pending ? pendingLabel : label}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cx("inline-block size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent", className)}
    />
  );
}
