"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { FieldShell, inputClass, type Option } from "@/components/admin/fields";
import { cx } from "@/components/admin/ui";

/** Sıralı çoklu seçim (ör. kitabın yazarları). Seçilenler gizli alanlarla sırasıyla gönderilir. */
export function OrderedPicker({
  name,
  label,
  options,
  initial,
  hint,
  addLabel = "Ekle…",
  emptyText = "Henüz seçim yapılmadı.",
  createHref,
  createLabel,
}: {
  name: string;
  label: string;
  options: Option[];
  initial: string[];
  hint?: string;
  addLabel?: string;
  emptyText?: string;
  createHref?: string;
  createLabel?: string;
}) {
  const id = useId();
  const [selected, setSelected] = useState<string[]>(initial.filter((v) => options.some((o) => o.value === v)));
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? "?";
  const remaining = options.filter((o) => !selected.includes(o.value));

  function move(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= selected.length) return;
    const next = [...selected];
    [next[i], next[j]] = [next[j], next[i]];
    setSelected(next);
  }

  return (
    <FieldShell id={id} label={label} hint={hint}>
      {selected.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
      {selected.length > 0 ? (
        <ol className="mb-2 divide-y divide-rule rounded-md border border-rule">
          {selected.map((v, i) => (
            <li key={v} className="flex items-center gap-2 px-3 py-1.5 text-sm">
              <span className="w-5 text-xs text-muted tabular-nums">{i + 1}.</span>
              <span className="flex-1 truncate">{labelOf(v)}</span>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded px-1.5 text-muted hover:bg-paper-2 disabled:opacity-25" aria-label={`Yukarı taşı: ${labelOf(v)}`}>
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === selected.length - 1} className="rounded px-1.5 text-muted hover:bg-paper-2 disabled:opacity-25" aria-label={`Aşağı taşı: ${labelOf(v)}`}>
                ↓
              </button>
              <button type="button" onClick={() => setSelected(selected.filter((x) => x !== v))} className="rounded px-1.5 text-muted hover:bg-red-50 hover:text-red-700" aria-label={`Kaldır: ${labelOf(v)}`}>
                ×
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mb-2 text-sm text-muted">{emptyText}</p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <select
          id={id}
          value=""
          onChange={(e) => e.target.value && setSelected([...selected, e.target.value])}
          className={cx(inputClass, "sm:max-w-xs")}
          disabled={remaining.length === 0}
        >
          <option value="">{remaining.length ? addLabel : "Eklenecek kayıt kalmadı"}</option>
          {remaining.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {createHref && (
          <Link href={createHref} target="_blank" className="text-sm text-muted underline-offset-2 hover:text-ink hover:underline">
            {createLabel ?? "Yeni oluştur"} ↗
          </Link>
        )}
      </div>
    </FieldShell>
  );
}
