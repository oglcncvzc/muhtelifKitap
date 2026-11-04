"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminForm } from "@/components/admin/admin-form";
import { TextField } from "@/components/admin/fields";
import { Notice } from "@/components/admin/ui";
import { loginAction, requestResetAction, setNewPasswordAction } from "./actions";

export function LoginForm() {
  return (
    <AdminForm
      action={loginAction}
      submitLabel="Giriş yap"
      pendingLabel="Giriş yapılıyor…"
      footerClassName="[&>button]:w-full"
      toast={false}
      aria-label="Giriş formu"
    >
      <div className="space-y-4">
        <TextField name="email" type="email" label="E-posta" autoComplete="username" required autoFocus inputMode="email" />
        <TextField name="password" type="password" label="Şifre" autoComplete="current-password" required />
      </div>
      <p className="mt-3 text-right text-sm">
        <Link href="/admin/sifremi-unuttum" className="text-muted underline-offset-2 hover:text-ink hover:underline">
          Şifremi unuttum
        </Link>
      </p>
    </AdminForm>
  );
}

export function ResetRequestForm() {
  const [sent, setSent] = useState<string | null>(null);
  if (sent) {
    return (
      <div className="space-y-4">
        <Notice tone="success">{sent}</Notice>
        <Link href="/admin/giris" className="block text-center text-sm text-muted hover:text-ink">
          ← Girişe dön
        </Link>
      </div>
    );
  }
  return (
    <AdminForm
      action={requestResetAction}
      onSuccess={(s) => setSent(s.message ?? "")}
      submitLabel="Bağlantı gönder"
      pendingLabel="Gönderiliyor…"
      footerClassName="[&>button]:w-full"
      toast={false}
    >
      <TextField name="email" type="email" label="E-posta" autoComplete="email" required autoFocus />
    </AdminForm>
  );
}

export function NewPasswordForm() {
  return (
    <AdminForm action={setNewPasswordAction} submitLabel="Şifreyi kaydet" footerClassName="[&>button]:w-full" toast={false}>
      <div className="space-y-4">
        <TextField name="password" type="password" label="Yeni şifre" autoComplete="new-password" required minLength={8} hint="En az 8 karakter." />
        <TextField name="confirm" type="password" label="Yeni şifre (tekrar)" autoComplete="new-password" required minLength={8} />
      </div>
    </AdminForm>
  );
}
