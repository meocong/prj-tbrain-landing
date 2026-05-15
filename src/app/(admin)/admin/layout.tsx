import type { Metadata } from "next";
import Script from "next/script";
import { AdminAuthProvider } from "@/lib/admin/auth-context";
import { AdminShell } from "@/components/admin/layout/app-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Admin — Tbrain",
    template: "%s | Admin — Tbrain",
  },
  robots: "noindex, nofollow",
};

const THEME_INIT = `
(function(){try{
  var t=localStorage.getItem('tbrain-admin-theme');
  var wantLight=t==='light'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches);
  if(wantLight){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}
}catch(e){}})();
`;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" id="admin-root">
      <Script id="admin-theme-init" strategy="beforeInteractive">
        {THEME_INIT}
      </Script>
      <AdminAuthProvider>
        <AdminShell>{children}</AdminShell>
      </AdminAuthProvider>
    </div>
  );
}
