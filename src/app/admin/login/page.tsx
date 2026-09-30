import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/app/admin/login/login-form";
import { getAdminUser } from "@/server/auth-guard";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdminUser()) redirect("/admin");
  const { callbackUrl } = await searchParams;

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-12">
      <div aria-hidden="true" className="bg-grid mask-radial absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="absolute -top-40 left-1/2 -z-10 h-[30rem] w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand)_18%,transparent),transparent)] blur-2xl"
      />
      <div className="w-full max-w-sm">
        <Link prefetch={false} href="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to site
        </Link>
        <div className="rounded-3xl border bg-card p-7 shadow-lift sm:p-8">
          <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-xl font-semibold">Sign in to the dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Restricted area. Authorized administrators only.</p>
          <LoginForm callbackUrl={typeof callbackUrl === "string" ? callbackUrl : "/admin"} />
        </div>
      </div>
    </main>
  );
}
