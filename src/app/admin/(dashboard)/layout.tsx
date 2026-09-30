import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/server/auth-guard";
import { getTrust } from "@/server/queries/public";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // Server-side authorization for every admin page (the proxy is only a fast path).
  const user = await requireAdminPage();
  const [trust, unread] = await Promise.all([getTrust(), db.contactMessage.count({ where: { status: "UNREAD" } })]);

  return (
    <AdminShell
      user={{ name: user.name ?? user.email, email: user.email, role: user.role }}
      siteName={trust.namePending ? "Trust admin" : (trust.shortName?.en ?? trust.name.en)}
      unread={unread}
    >
      {children}
    </AdminShell>
  );
}
