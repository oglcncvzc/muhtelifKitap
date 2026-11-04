"use client";

import { useMemo, useState } from "react";
import { AdminForm } from "@/components/admin/admin-form";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { TextArea, TextField } from "@/components/admin/fields";
import { ImageUpload } from "@/components/admin/image-upload";
import { SlugField, useAutoSlug } from "@/components/admin/slug-field";
import { SortableList } from "@/components/admin/sortable-list";
import { buttonClass, Card, Thumb } from "@/components/admin/ui";
import { deleteTaxonomyAction, saveTaxonomyAction } from "@/lib/admin/taxonomy-actions";
import { TAXONOMIES, type TaxonomyKind, type TaxonomyRow } from "@/lib/admin/taxonomy";

/** Sözlük tablosu yöneticisi: satır içi ekleme, düzenleme, silme ve sıralama. */
export function TaxonomyManager({ kind, items, counts }: { kind: TaxonomyKind; items: TaxonomyRow[]; counts: Record<string, number> }) {
  const cfg = TAXONOMIES[kind];
  const [formKey, setFormKey] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const usageNoun = cfg.usage.table === "books" ? "kitap" : "bağlantı";

  return (
    <div className="space-y-6">
      <Card title={`Yeni ${cfg.singular} ekle`}>
        <TaxonomyForm key={formKey} kind={kind} item={null} onSaved={() => setFormKey((k) => k + 1)} />
      </Card>

      <SortableList
        table={kind}
        items={items}
        getLabel={(i) => String(i[cfg.nameField] ?? "")}
        emptyTitle={`Henüz ${cfg.singular} eklenmemiş.`}
        renderItem={(item) => {
          const n = counts[item.id] ?? 0;
          const name = String(item[cfg.nameField] ?? "");
          const secondary = cfg.secondaryField ? item[cfg.secondaryField] : null;
          return (
            <div>
              <div className="flex items-center gap-3 px-3 py-2">
                {kind === "imprints" && (
                  <Thumb src={item.logo_url as string | null} className="size-9 shrink-0 rounded border border-rule bg-white object-contain p-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {name}
                    {secondary ? <span className="font-normal text-muted"> · {String(secondary)}</span> : null}
                  </p>
                  <p className="truncate font-mono text-[11px] text-muted">
                    {item.slug} · {n} {usageNoun}
                  </p>
                </div>
                <button
                  type="button"
                  className={buttonClass("secondary", "sm")}
                  aria-expanded={editing === item.id}
                  onClick={() => setEditing(editing === item.id ? null : item.id)}
                >
                  {editing === item.id ? "Kapat" : "Düzenle"}
                </button>
                <ConfirmAction
                  action={() => deleteTaxonomyAction(kind, item.id)}
                  label="Sil"
                  ariaLabel={`Sil: ${name}`}
                  title={`“${name}” silinsin mi?`}
                  message={
                    <>
                      <p>Bu işlem geri alınamaz.</p>
                      {n > 0 && <p className="mt-2 font-medium text-amber-800">{cfg.usageWarning(n)}</p>}
                    </>
                  }
                />
              </div>
              {editing === item.id && (
                <div className="border-t border-rule bg-paper/40 px-3 py-4">
                  <TaxonomyForm kind={kind} item={item} onSaved={() => setEditing(null)} />
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}

function TaxonomyForm({ kind, item, onSaved }: { kind: TaxonomyKind; item: TaxonomyRow | null; onSaved: () => void }) {
  const cfg = TAXONOMIES[kind];
  const slug = useAutoSlug(item?.slug ?? "", String(item?.[cfg.nameField] ?? ""), !item);
  const action = useMemo(() => saveTaxonomyAction.bind(null, kind), [kind]);

  return (
    <AdminForm action={action} submitLabel={item ? "Kaydet" : "Ekle"} pendingLabel={item ? "Kaydediliyor…" : "Ekleniyor…"} onSuccess={onSaved}>
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        {cfg.fields.map((field) => {
          const value = item?.[field.name];
          const def = value == null ? "" : String(value);
          if (field.type === "textarea")
            return <TextArea key={field.name} name={field.name} label={field.label} tag={field.tag} rows={3} defaultValue={def} required={field.required} />;
          if (field.type === "image")
            return (
              <div key={field.name} className="md:col-span-2">
                <ImageUpload
                  label={field.label}
                  hint="PNG/SVG/WebP; uzun kenarı 800 px'e küçültülür."
                  bucket="media"
                  folder={cfg.imageFolder ?? kind}
                  baseName={slug.slug || cfg.singular}
                  maxEdge={800}
                  names={{ url: field.name }}
                  initial={{ url: def || null }}
                />
              </div>
            );
          return (
            <TextField
              key={field.name}
              name={field.name}
              label={field.label}
              tag={field.tag}
              type={field.type === "url" ? "url" : "text"}
              inputMode={field.type === "url" ? "url" : undefined}
              placeholder={field.type === "url" ? "https://" : undefined}
              defaultValue={def}
              required={field.required}
              onChange={field.name === cfg.nameField ? (e) => slug.onSource(e.target.value) : undefined}
            />
          );
        })}
        <SlugField value={slug.slug} onChange={slug.setSlug} source={slug.source} auto={slug.auto} onAutoChange={slug.setAuto} />
      </div>
    </AdminForm>
  );
}
