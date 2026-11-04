"use client";

import { AdminForm } from "@/components/admin/admin-form";
import { TextField } from "@/components/admin/fields";
import { changePasswordAction } from "./actions";

export function PasswordForm() {
  return (
    <AdminForm action={changePasswordAction} submitLabel="Şifreyi değiştir" resetOnSuccess>
      <div className="grid max-w-md gap-4">
        <TextField name="current" type="password" label="Mevcut şifre" autoComplete="current-password" required />
        <TextField name="password" type="password" label="Yeni şifre" autoComplete="new-password" required minLength={8} hint="En az 8 karakter." />
        <TextField name="confirm" type="password" label="Yeni şifre (tekrar)" autoComplete="new-password" required minLength={8} />
      </div>
    </AdminForm>
  );
}
