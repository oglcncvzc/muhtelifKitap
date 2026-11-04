import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { AuthorForm } from "../author-form";

export const metadata: Metadata = { title: "Yeni yazar" };

export default function NewAuthorPage() {
  return (
    <>
      <PageHeader title="Yeni yazar" back={{ href: "/admin/yazarlar", label: "Yazarlar" }} />
      <AuthorForm author={null} />
    </>
  );
}
