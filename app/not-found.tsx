import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-24 sm:px-8 sm:py-32">
      <p className="label text-muted">404</p>
      <h1 className="display mt-4 text-[clamp(4rem,12vw,11rem)]">Bu sayfa rafta yok</h1>
      <p className="mt-6 max-w-lg text-xl text-ink-2">
        Aradığınız sayfa taşınmış ya da hiç basılmamış olabilir.
      </p>
      <Link href="/kitaplar" className="label mt-10 inline-flex h-12 items-center gap-3 bg-ink px-6 text-paper hover:bg-ink-2">
        Kataloğa dön <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
