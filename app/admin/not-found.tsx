import { ButtonLink } from "@/components/admin/ui";

export default function AdminNotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="text-sm text-muted">404</p>
      <h1 className="mt-1 text-xl font-semibold">Sayfa bulunamadı</h1>
      <p className="mt-2 text-sm text-muted">Aradığınız kayıt silinmiş ya da adres hatalı olabilir.</p>
      <div className="mt-6">
        <ButtonLink href="/admin" variant="primary">
          Panele dön
        </ButtonLink>
      </div>
    </div>
  );
}
