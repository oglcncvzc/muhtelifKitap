"use server";

import { getSupabase } from "@/lib/supabase";

export type ContactState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Basit bot tuzağı: görünmeyen alan doldurulduysa sessizce başarılı say.
  if (String(formData.get("website") ?? "").trim()) return { status: "ok" };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "genel").trim();
  const message = String(formData.get("message") ?? "").trim();

  const fieldErrors: ContactState["fieldErrors"] = {};
  if (name.length < 2) fieldErrors.name = "Adınızı yazın.";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Geçerli bir e-posta adresi yazın.";
  if (message.length < 10) fieldErrors.message = "Mesajınız en az 10 karakter olmalı.";
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors };

  const supabase = getSupabase();
  if (!supabase) {
    return {
      status: "error",
      message: "İletişim formu henüz yapılandırılmadı. Lütfen daha sonra tekrar deneyin.",
    };
  }

  const { error } = await supabase.from("contact_messages").insert({
    name: name.slice(0, 120),
    email: email.slice(0, 200),
    subject: subject.slice(0, 40),
    message: message.slice(0, 5000),
  });

  if (error) {
    console.error("[iletisim]", error.message);
    return { status: "error", message: "Mesajınız gönderilemedi. Lütfen tekrar deneyin." };
  }
  return { status: "ok" };
}
