import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/server/auth-guard";
import { getSiteSettings } from "@/server/queries/public";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side authorization for every admin page (the proxy is only a fast path).
  const user = await requireAdminPage();
  const [settings, unread] = await Promise.all([
    getSiteSettings(),
    db.contactMessage.count({ where: { status: "UNREAD" } }),
  ]);

  return (
    <AdminShell
      user={{ name: user.name ?? user.email, email: user.email, role: user.role }}
      siteName={settings.siteName}
      unread={unread}
    >
      {children}
    </AdminShell>
  );
}
