import { notFound } from "next/navigation";

/** Her zaman 404 verir; anında geçiş doğrulamasına gerek yok. */
export const instant = false;

/** Eşleşmeyen tüm yollar dilin kendi 404 sayfasına (header/footer ile) düşer. */
export default function CatchAll() {
  notFound();
}
