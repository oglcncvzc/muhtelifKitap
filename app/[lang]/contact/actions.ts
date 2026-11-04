"use server";

import { getDict, isLocale } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabase";

export type ContactState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBJECTS = ["genel", "dosya", "basin", "satis"];

export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const rawLang = String(formData.get("lang") ?? "tr");
  const t = getDict(isLocale(rawLang) ? rawLang : "tr").form;

  // Bot tuzağı: görünmeyen alan doluysa sessizce başarılı say.
  if (String(formData.get("website") ?? "").trim()) return { status: "ok" };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subjectRaw = String(formData.get("subject") ?? "genel");
  const subject = SUBJECTS.includes(subjectRaw) ? subjectRaw : "genel";
  const message = String(formData.get("message") ?? "").trim();

  const fieldErrors: ContactState["fieldErrors"] = {};
  if (name.length < 2) fieldErrors.name = t.errName;
  if (!EMAIL_RE.test(email)) fieldErrors.email = t.errEmail;
  if (message.length < 10) fieldErrors.message = t.errMessage;
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors };

  const supabase = getSupabase();
  if (!supabase) return { status: "error", message: t.errSend };

  const { error } = await supabase.from("contact_messages").insert({
    name: name.slice(0, 120),
    email: email.slice(0, 200),
    subject,
    message: message.slice(0, 5000),
  });
  if (error) {
    console.error("[iletisim]", error.message);
    return { status: "error", message: t.errSend };
  }
  return { status: "ok" };
}
