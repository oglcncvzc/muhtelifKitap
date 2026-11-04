/** Server Action ↔ form arasındaki ortak durum tipi (istemci ve sunucuda kullanılır). */
export type FieldErrors = Record<string, string>;

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: FieldErrors;
  /** Aynı mesajın art arda gösterilmesi için zaman damgası. */
  at?: number;
};

export const IDLE: ActionState = { status: "idle" };

export const ok = (message: string): ActionState => ({ status: "success", message, at: Date.now() });

export const fail = (message: string, errors?: FieldErrors): ActionState => ({
  status: "error",
  message,
  errors,
  at: Date.now(),
});

export const INVALID = "Lütfen işaretli alanları kontrol edin.";
