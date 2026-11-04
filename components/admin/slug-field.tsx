"use client";

import { useId, useState } from "react";
import { useFieldError } from "@/components/admin/admin-form";
import { FieldShell, inputClass } from "@/components/admin/fields";
import { slugify } from "@/lib/admin/slug";
import { buttonClass, cx } from "@/components/admin/ui";

/**
 * Kontrollü slug alanı. Ebeveyn, kaynak (başlık/ad) değiştikçe `auto` açıksa
 * slugify(kaynak) değerini verir; kullanıcı elle değiştirince otomatik mod kapanır.
 */
export function SlugField({
  value,
  onChange,
  source,
  auto,
  onAutoChange,
  prefix,
  name = "slug",
}: {
  value: string;
  onChange: (v: string) => void;
  source: string;
  auto: boolean;
  onAutoChange: (auto: boolean) => void;
  prefix?: string;
  name?: string;
}) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <FieldShell
      id={id}
      label="Kısa ad (URL)"
      required
      error={error}
      hint={
        <>
          Küçük harf, rakam ve tire. {auto ? "Başlıktan otomatik üretiliyor." : "Elle düzenlendi."}
          {prefix && value && <span className="mt-0.5 block truncate font-mono text-[11px]">{prefix}{value}</span>}
        </>
      }
    >
      <div className="flex gap-2">
        <input
          id={id}
          name={name}
          value={value}
          onChange={(e) => {
            onAutoChange(false);
            onChange(e.target.value.toLowerCase().replace(/\s+/g, "-"));
          }}
          onBlur={(e) => onChange(slugify(e.target.value))}
          required
          spellCheck={false}
          autoCapitalize="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
          className={cx(inputClass, "font-mono text-[13px]")}
        />
        <button
          type="button"
          className={buttonClass("secondary")}
          onClick={() => {
            onAutoChange(true);
            onChange(slugify(source));
          }}
          title="Başlıktan yeniden üret"
        >
          Üret
        </button>
      </div>
    </FieldShell>
  );
}

/** Slug durumunu yönetir: yeni kayıtta kaynak metinden otomatik üretir. */
export function useAutoSlug(initialSlug: string, initialSource: string, isNew: boolean) {
  const [slug, setSlug] = useState(initialSlug);
  const [auto, setAuto] = useState(isNew && !initialSlug);
  const [source, setSource] = useState(initialSource);
  return {
    slug,
    setSlug,
    auto,
    setAuto,
    source,
    /** Kaynak alanın onChange'inde çağrılır. */
    onSource(value: string) {
      setSource(value);
      if (auto) setSlug(slugify(value));
    },
  };
}
