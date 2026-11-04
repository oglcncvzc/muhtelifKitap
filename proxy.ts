import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES, toInternalPath, type RouteKey } from "@/lib/i18n";

const ADMIN_HOST_PREFIX = "muhtelif-kitap-admin.";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  // Ayrı yönetim adresi: muhtelif-kitap-admin.vercel.app → /admin
  if (host.startsWith(ADMIN_HOST_PREFIX) && !pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname.startsWith("/admin")) return refreshAdminSession(request);

  // İç yollar (/tr/...) doğrudan açılırsa herkese açık TR adresine yönlendir.
  if (pathname === "/tr" || pathname.startsWith("/tr/")) {
    const [, , key, ...rest] = pathname.split("/");
    const route = ROUTES[key as RouteKey];
    const target = route ? `/${route.tr}${rest.length ? `/${rest.join("/")}` : ""}` : "/";
    return NextResponse.redirect(new URL(target + search, request.url), 308);
  }

  return NextResponse.rewrite(new URL(toInternalPath(pathname) + search, request.url));
}

/** Supabase oturum çerezini yeniler (yönetim paneli). */
async function refreshAdminSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          for (const { name, value } of toSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Oturum yoksa korumalı sayfalardan gerçek 307 ile girişe. (Yönetici yetkisi
  // ayrıca panel layout'unda ve her Server Action'da is_admin() ile denetlenir.)
  const p = request.nextUrl.pathname;
  const isPublic =
    ["/admin/giris", "/admin/sifremi-unuttum", "/admin/sifre-yenile"].includes(p) || p.startsWith("/admin/auth/");
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/giris";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    for (const c of response.cookies.getAll()) redirect.cookies.set(c);
    return redirect;
  }
  return response;
}

export const config = {
  // _next, api ve uzantılı dosyalar (görseller, sitemap.xml, robots.txt…) hariç
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};
