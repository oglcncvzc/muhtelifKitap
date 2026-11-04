import type { Metadata } from "next";
import { Suspense } from "react";
import { buttonClass, Card, LoadingBlock, PageHeader } from "@/components/admin/ui";
import { adminDb } from "@/lib/admin/db";
import { signOutAction } from "./actions";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Hesabım" };

export default function AccountPage() {
  return (
    <>
      <PageHeader title="Hesabım" description="Şifrenizi değiştirin ya da oturumu kapatın." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card title="Şifre değiştir" description="Güvenliğiniz için mevcut şifrenizi de girmeniz gerekir.">
          <PasswordForm />
        </Card>
        <Card title="Oturum">
          <Suspense fallback={<LoadingBlock rows={1} />}>
            <SessionInfo />
          </Suspense>
          <form action={signOutAction} className="mt-4">
            <button type="submit" className={buttonClass("secondary")}>
              Çıkış yap
            </button>
          </form>
        </Card>
      </div>
    </>
  );
}

async function SessionInfo() {
  const { admin } = await adminDb();
  return (
    <p className="text-sm">
      Giriş yapan: <span className="font-medium break-all">{admin.email}</span>
    </p>
  );
}
