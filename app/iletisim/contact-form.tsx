"use client";

import { useActionState } from "react";
import { sendMessage, type ContactState } from "./actions";

const SUBJECTS = [
  { value: "genel", label: "Genel" },
  { value: "dosya", label: "Dosya gönderimi" },
  { value: "basin", label: "Basın" },
  { value: "satis", label: "Satış & dağıtım" },
];

const field =
  "mt-2 w-full border-b border-ink bg-transparent py-2 text-xl outline-none transition-colors placeholder:text-muted/70 placeholder:italic focus:border-b-2 aria-[invalid=true]:border-red-700";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, { status: "idle" });

  if (state.status === "ok") {
    return (
      <div role="status" className="border border-ink p-10">
        <p className="display text-6xl">Teşekkürler</p>
        <p className="mt-4 text-xl text-ink-2">Mesajınız bize ulaştı. En kısa sürede dönüş yapacağız.</p>
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} noValidate className="space-y-10">
      <fieldset>
        <legend className="label text-muted">Konu</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUBJECTS.map((s, i) => (
            <label key={s.value} className="cursor-pointer">
              <input type="radio" name="subject" value={s.value} defaultChecked={i === 0} className="peer sr-only" />
              <span className="label flex h-10 items-center border border-rule px-4 transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 hover:border-ink">
                {s.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-10 sm:grid-cols-2">
        <label className="block">
          <span className="label text-muted">Ad Soyad</span>
          <input name="name" autoComplete="name" required aria-invalid={!!fe.name} aria-describedby="e-name" className={field} placeholder="Adınız" />
          {fe.name && <span id="e-name" className="mt-2 block text-red-700">{fe.name}</span>}
        </label>
        <label className="block">
          <span className="label text-muted">E-posta</span>
          <input name="email" type="email" autoComplete="email" inputMode="email" required aria-invalid={!!fe.email} aria-describedby="e-email" className={field} placeholder="ornek@eposta.com" />
          {fe.email && <span id="e-email" className="mt-2 block text-red-700">{fe.email}</span>}
        </label>
      </div>

      <label className="block">
        <span className="label text-muted">Mesaj</span>
        <textarea name="message" rows={6} required aria-invalid={!!fe.message} aria-describedby="e-message" className={`${field} resize-y`} placeholder="Bize ne söylemek istersiniz?" />
        {fe.message && <span id="e-message" className="mt-2 block text-red-700">{fe.message}</span>}
      </label>

      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Web sitesi
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.message && (
        <p role="alert" className="border-l-2 border-red-700 pl-4 text-lg text-red-800">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="label inline-flex h-14 items-center gap-3 bg-ink px-8 text-paper transition-colors hover:bg-ink-2 disabled:opacity-60"
      >
        {pending ? "Gönderiliyor…" : "Gönder"} <span aria-hidden>→</span>
      </button>
    </form>
  );
}
