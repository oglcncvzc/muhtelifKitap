"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { reorderAction } from "@/lib/admin/reorder";
import { Spinner } from "@/components/admin/admin-form";
import { inputClass } from "@/components/admin/fields";
import { useToast } from "@/components/admin/toast";
import { cx, EmptyState } from "@/components/admin/ui";

type Table = Parameters<typeof reorderAction>[0];

/**
 * Sıralanabilir liste: yukarı/aşağı düğmeleri ve tutamaçtan sürükle-bırak.
 * Her değişiklikten kısa süre sonra sort_order (10, 20, 30…) olarak kaydedilir.
 */
export function SortableList<T extends { id: string }>({
  table,
  items,
  renderItem,
  getLabel,
  search,
  emptyTitle = "Henüz kayıt yok.",
  emptyAction,
  toolbar,
}: {
  table: Table;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getLabel: (item: T) => string;
  search?: { placeholder: string; getText: (item: T) => string };
  emptyTitle?: string;
  emptyAction?: ReactNode;
  toolbar?: ReactNode;
}) {
  const serverKey = items.map((i) => i.id).join(",");
  const [prevKey, setPrevKey] = useState(serverKey);
  const [order, setOrder] = useState<string[]>(() => items.map((i) => i.id));
  if (prevKey !== serverKey) {
    setPrevKey(serverKey);
    setOrder(items.map((i) => i.id));
  }

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const ordered = order.map((id) => byId.get(id)).filter((x): x is T => Boolean(x));

  const [query, setQuery] = useState("");
  const q = normalize(query);
  const visible = q && search ? ordered.filter((i) => normalize(search.getText(i)).includes(q)) : ordered;
  const filtering = Boolean(q);

  const [saving, startSave] = useTransition();
  const [dirty, setDirty] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const push = useToast();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function commit(next: string[]) {
    setOrder(next);
    setDirty(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      startSave(async () => {
        const res = await reorderAction(table, next);
        setDirty(false);
        if (res.status === "error") {
          push("error", res.message ?? "Sıralama kaydedilemedi.");
          setOrder(items.map((i) => i.id));
        }
      });
    }, 600);
  }

  function move(id: string, delta: number) {
    const i = order.indexOf(id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  }

  // Sürükle-bırak (yalnızca tutamaçtan)
  const [armed, setArmed] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const dragStart = useRef<string[] | null>(null);

  function dragOver(overId: string) {
    if (!dragging || dragging === overId) return;
    setOrder((cur) => {
      const from = cur.indexOf(dragging);
      const to = cur.indexOf(overId);
      if (from < 0 || to < 0) return cur;
      const next = [...cur];
      next.splice(from, 1);
      next.splice(to, 0, dragging);
      return next;
    });
  }

  if (items.length === 0) return <EmptyState title={emptyTitle} action={emptyAction} />;

  return (
    <div>
      {(search || toolbar) && (
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          {search && (
            <div className="relative sm:max-w-xs sm:flex-1">
              <label className="sr-only" htmlFor={`ara-${table}`}>
                Ara
              </label>
              <input
                id={`ara-${table}`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={search.placeholder}
                className={inputClass}
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      <div className="mb-2 flex min-h-5 items-center justify-between gap-2 text-xs text-muted" aria-live="polite">
        <span>
          {filtering
            ? `${visible.length} / ${ordered.length} kayıt · Arama sırasında sıralama kapalıdır.`
            : `${ordered.length} kayıt · Sırayı değiştirmek için okları kullanın ya da tutamaçtan sürükleyin.`}
        </span>
        {(saving || dirty) && (
          <span className="inline-flex items-center gap-1.5">
            <Spinner /> Sıralama kaydediliyor…
          </span>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="Aramanızla eşleşen kayıt bulunamadı." />
      ) : (
        <ol className="divide-y divide-rule overflow-hidden rounded-lg border border-rule bg-white">
          {visible.map((item, index) => {
            const pos = order.indexOf(item.id);
            const label = getLabel(item);
            return (
              <li
                key={item.id}
                draggable={!filtering && armed === item.id}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", item.id);
                  dragStart.current = order;
                  setDragging(item.id);
                }}
                onDragOver={(e) => {
                  if (!dragging) return;
                  e.preventDefault();
                  dragOver(item.id);
                }}
                onDrop={(e) => e.preventDefault()}
                onDragEnd={() => {
                  const before = dragStart.current?.join(",");
                  setDragging(null);
                  setArmed(null);
                  dragStart.current = null;
                  if (before !== order.join(",")) commit(order);
                }}
                className={cx("flex items-stretch gap-1 bg-white", dragging === item.id && "opacity-50")}
              >
                {!filtering && (
                  <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 border-r border-rule px-1 py-1 sm:flex-row sm:px-1.5">
                    <span
                      onPointerDown={() => setArmed(item.id)}
                      onPointerUp={() => !dragging && setArmed(null)}
                      className="hidden cursor-grab touch-none px-1 text-muted select-none hover:text-ink sm:block"
                      title="Sürükleyerek taşı"
                      aria-hidden
                    >
                      ⋮⋮
                    </span>
                    <button
                      type="button"
                      onClick={() => move(item.id, -1)}
                      disabled={pos === 0}
                      className="rounded px-1.5 py-0.5 text-muted hover:bg-paper-2 hover:text-ink disabled:opacity-25"
                      aria-label={`Yukarı taşı: ${label}`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(item.id, 1)}
                      disabled={pos === order.length - 1}
                      className="rounded px-1.5 py-0.5 text-muted hover:bg-paper-2 hover:text-ink disabled:opacity-25"
                      aria-label={`Aşağı taşı: ${label}`}
                    >
                      ↓
                    </button>
                  </div>
                )}
                <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function normalize(s: string) {
  return s
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .trim();
}
