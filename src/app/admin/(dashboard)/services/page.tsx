import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ServiceIcon } from "@/components/shared/service-icon";
import { PageHeader } from "@/components/admin/page-header";
import { DeleteButton, EditButton, ToggleAction } from "@/components/admin/row-actions";
import { deleteService, setServicePublished } from "@/server/actions/admin/services";
import { listServices } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Services" };

export default async function AdminServicesPage() {
  const services = await listServices();

  return (
    <>
      <PageHeader
        title="Services"
        description="Offerings shown in the Services section."
        actions={
          <Button asChild>
            <Link href="/admin/services/new">
              <Plus aria-hidden="true" /> New service
            </Link>
          </Button>
        }
      />
      {services.length === 0 ? (
        <EmptyState icon={Sparkles} title="No services yet" description="Describe how clients can work with you." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <li key={service.id} className="flex flex-col rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  <ServiceIcon name={service.icon} className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/services/${service.id}`} className="font-semibold hover:text-brand">
                    {service.title}
                  </Link>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t pt-4">
                <ToggleAction checked={service.isPublished} action={setServicePublished.bind(null, service.id)} label={`Publish ${service.title}`} />
                <span className="text-xs text-muted-foreground">{service.isPublished ? "Published" : "Hidden"}</span>
                {service.isFeatured && <Badge variant="brand">Highlighted</Badge>}
                <span className="ml-auto text-sm font-medium">{service.pricing ?? "Custom"}</span>
                <EditButton href={`/admin/services/${service.id}`} label={`Edit ${service.title}`} />
                <DeleteButton action={deleteService.bind(null, service.id)} itemName={`“${service.title}”`} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
