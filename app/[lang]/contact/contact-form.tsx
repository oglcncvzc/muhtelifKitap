"use client";

import Link from "next/link";
import { useActionState } from "react";
import { getDict, href } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { sendMessage, type ContactState } from "./actions";

const field =
  "mt-2 w-full border-b border-ink bg-transparent py-2 text-lg outline-none transition-colors placeholder:text-muted/70 placeholder:italic focus:border-b-2 aria-[invalid=true]:border-red-700";

export function ContactForm({ lang }: { lang: Locale }) {
  const t = getDict(lang).form;
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, { status: "idle" });

  if (state.status === "ok") {
    return (
      <div role="status" className="border border-ink p-8">
        <p className="display text-5xl">{t.thanksTitle}</p>
        <p className="mt-3 text-lg text-ink-2">{t.thanks}</p>
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} noValidate className="space-y-8">
      <input type="hidden" name="lang" value={lang} />
      <fieldset>
        <legend className="label text-muted">{t.subject}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(t.subjects) as (keyof typeof t.subjects)[]).map((k, i) => (
            <label key={k} className="cursor-pointer">
              <input type="radio" name="subject" value={k} defaultChecked={i === 0} className="peer sr-only" />
              <span className="flex h-9 items-center border border-rule px-3.5 text-[15px] transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 hover:border-ink">
                {t.subjects[k]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-8 sm:grid-cols-2">
        <label className="block">
          <span className="label text-muted">{t.name}</span>
          <input name="name" autoComplete="name" required aria-invalid={!!fe.name} aria-describedby="e-name" className={field} placeholder={t.namePh} />
          {fe.name && <span id="e-name" className="mt-2 block text-red-700">{fe.name}</span>}
        </label>
        <label className="block">
          <span className="label text-muted">{t.email}</span>
          <input name="email" type="email" autoComplete="email" inputMode="email" required aria-invalid={!!fe.email} aria-describedby="e-email" className={field} placeholder={t.emailPh} />
          {fe.email && <span id="e-email" className="mt-2 block text-red-700">{fe.email}</span>}
        </label>
      </div>

      <label className="block">
        <span className="label text-muted">{t.message}</span>
        <textarea name="message" rows={6} required aria-invalid={!!fe.message} aria-describedby="e-message" className={`${field} resize-y`} placeholder={t.messagePh} />
        {fe.message && <span id="e-message" className="mt-2 block text-red-700">{fe.message}</span>}
      </label>

      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.message && (
        <p role="alert" className="border-l-2 border-red-700 pl-4 text-red-800">
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={pending}
          className="label inline-flex h-12 items-center gap-2 bg-ink px-7 text-paper transition-colors hover:bg-ink-2 disabled:opacity-60"
        >
          {pending ? t.sending : t.send} <span aria-hidden>→</span>
        </button>
        <p className="text-sm text-muted">
          <Link href={href(lang, "legal/kvkk")} className="underline underline-offset-4 hover:text-ink">
            {t.kvkk}
          </Link>
        </p>
      </div>
    </form>
  );
}
