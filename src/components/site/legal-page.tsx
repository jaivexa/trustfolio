import { Markdown } from "@/components/shared/markdown";
import { formatDate } from "@/lib/utils";

export function LegalPage({ title, updatedAt, body }: { title: string; updatedAt: string; body: string }) {
  return (
    <div className="container-page max-w-3xl py-16 sm:py-24">
      <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated {formatDate(updatedAt)}</p>
      <Markdown className="mt-10">{body}</Markdown>
    </div>
  );
}
