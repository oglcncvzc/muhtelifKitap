"use client";

import { AdminForm } from "@/components/admin/admin-form";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { TextField } from "@/components/admin/fields";
import { addAdminAction, removeAdminAction } from "./actions";

export function AddAdminForm() {
  return (
    <AdminForm action={addAdminAction} submitLabel="Yönetici ekle" pendingLabel="Ekleniyor…" resetOnSuccess>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField name="email" type="email" label="E-posta" required autoComplete="off" />
        <TextField name="password" type="text" label="Geçici şifre" required minLength={8} autoComplete="new-password" spellCheck={false} hint="En az 8 karakter." />
      </div>
    </AdminForm>
  );
}

export function RemoveAdminButton({ userId, email }: { userId: string; email: string }) {
  return (
    <ConfirmAction
      action={() => removeAdminAction(userId)}
      label="Kaldır"
      ariaLabel={`Yöneticiyi kaldır: ${email}`}
      title="Yönetici kaldırılsın mı?"
      message={
        <p>
          <strong>{email}</strong> panele erişimini kaybedecek ve kullanıcı hesabı silinecek.
        </p>
      }
      confirmLabel="Kaldır"
    />
  );
}
