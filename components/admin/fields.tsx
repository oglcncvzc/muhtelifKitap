"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useFieldError } from "@/components/admin/admin-form";
import { cx } from "@/components/admin/ui";

export const inputClass = cx(
  "block w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink shadow-xs",
  "placeholder:text-muted/70 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15",
  "disabled:bg-paper-2/50 disabled:text-muted aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500/15",
);

type FieldShellProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  counter?: ReactNode;
  children: ReactNode;
  tag?: string;
};

/** Etiket + açıklama + hata mesajı sarmalayıcısı. */
export function FieldShell({ id, label, hint, error, required, className, counter, children, tag }: FieldShellProps) {
  return (
    <div className={cx("min-w-0", className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
          {tag && (
            <span className="rounded bg-paper-2 px-1 py-px font-mono text-[10px] font-semibold tracking-wide text-ink-2">
              {tag}
            </span>
          )}
          {label}
          {required && (
            <span className="text-red-600" aria-hidden>
              *
            </span>
          )}
        </label>
        {counter}
      </div>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint: unknown, error: unknown) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

function Counter({ length, limit }: { length: number; limit: number }) {
  const over = length > limit;
  return (
    <span className={cx("text-[11px] tabular-nums", over ? "font-medium text-amber-700" : "text-muted")} aria-live="polite">
      {length}/{limit}
      {over && " · uzun"}
    </span>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "defaultValue"> & {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  defaultValue?: string | number | null;
  /** Önerilen azami karakter sayısı (sayaç gösterir, engellemez). */
  softLimit?: number;
  tag?: string;
  wrapperClassName?: string;
};

export function TextField({
  name,
  label,
  hint,
  defaultValue,
  softLimit,
  required,
  tag,
  wrapperClassName,
  className,
  onChange,
  ...rest
}: TextFieldProps) {
  const id = useId();
  const error = useFieldError(name);
  const [length, setLength] = useState(String(defaultValue ?? "").length);
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      tag={tag}
      className={wrapperClassName}
      counter={softLimit ? <Counter length={length} limit={softLimit} /> : null}
    >
      <input
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cx(inputClass, className)}
        onChange={(e) => {
          if (softLimit) setLength(e.target.value.length);
          onChange?.(e);
        }}
        {...rest}
      />
    </FieldShell>
  );
}

export function TextArea({
  name,
  label,
  hint,
  defaultValue,
  rows = 5,
  softLimit,
  required,
  tag,
  wrapperClassName,
  placeholder,
}: {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  defaultValue?: string | null;
  rows?: number;
  softLimit?: number;
  required?: boolean;
  tag?: string;
  wrapperClassName?: string;
  placeholder?: string;
}) {
  const id = useId();
  const error = useFieldError(name);
  const [length, setLength] = useState((defaultValue ?? "").length);
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      tag={tag}
      className={wrapperClassName}
      counter={softLimit ? <Counter length={length} limit={softLimit} /> : null}
    >
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cx(inputClass, "resize-y leading-relaxed")}
        onChange={softLimit ? (e) => setLength(e.target.value.length) : undefined}
      />
    </FieldShell>
  );
}

export type Option = { value: string; label: string };

export function SelectField({
  name,
  label,
  hint,
  options,
  defaultValue,
  placeholder = "— Seçilmedi —",
  required,
  wrapperClassName,
  value,
  onChange,
}: {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  options: Option[];
  defaultValue?: string | null;
  placeholder?: string | null;
  required?: boolean;
  wrapperClassName?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const id = useId();
  const error = useFieldError(name);
  const controlled = value !== undefined;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <select
        id={id}
        name={name}
        {...(controlled ? { value } : { defaultValue: defaultValue ?? "" })}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cx(inputClass, "pr-8")}
      >
        {placeholder !== null && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Checkbox({
  name,
  label,
  hint,
  defaultChecked,
  checked,
  onChange,
}: {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={id}
        type="checkbox"
        name={name}
        {...(checked !== undefined ? { checked } : { defaultChecked })}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-0.5 size-4 shrink-0 rounded border-rule accent-ink"
      />
      <div>
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {hint && (
          <p id={`${id}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

/** Türkçe/İngilizce alan çifti: masaüstünde yan yana, mobilde alt alta. */
export function BilingualField({
  label,
  name,
  defaults,
  multiline = false,
  rows,
  softLimit,
  hint,
  requiredTr = false,
  requiredEn = false,
  suffixes = ["_tr", "_en"],
}: {
  label: string;
  /** Alan adı kökü: "bio" → bio_tr / bio_en (suffixes ile değiştirilebilir). */
  name: string;
  defaults?: { tr?: string | null; en?: string | null };
  multiline?: boolean;
  rows?: number;
  softLimit?: number;
  hint?: ReactNode;
  requiredTr?: boolean;
  requiredEn?: boolean;
  suffixes?: [string, string];
}) {
  const [trName, enName] = [`${name}${suffixes[0]}`, `${name}${suffixes[1]}`];
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{label}</legend>
      <div className="grid gap-4 md:grid-cols-2">
        {multiline ? (
          <>
            <TextArea name={trName} label={label} tag="TR" defaultValue={defaults?.tr} rows={rows} softLimit={softLimit} required={requiredTr} />
            <TextArea name={enName} label={label} tag="EN" defaultValue={defaults?.en} rows={rows} softLimit={softLimit} required={requiredEn} />
          </>
        ) : (
          <>
            <TextField name={trName} label={label} tag="TR" defaultValue={defaults?.tr} softLimit={softLimit} required={requiredTr} />
            <TextField name={enName} label={label} tag="EN" defaultValue={defaults?.en} softLimit={softLimit} required={requiredEn} />
          </>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </fieldset>
  );
}

