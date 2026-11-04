import { ToastProvider } from "@/components/admin/toast";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <main className="flex min-h-dvh items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <p className="mb-6 text-center text-[15px] font-semibold tracking-tight">
            Muhtelif Kitap <span className="font-normal text-muted">· Yönetim</span>
          </p>
          <div className="rounded-lg border border-rule bg-white p-6 shadow-sm sm:p-7">{children}</div>
        </div>
      </main>
    </ToastProvider>
  );
}
