import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, FolderKanban, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { SmartImage } from "@/components/shared/smart-image";
import { DataCard, PageHeader } from "@/components/admin/page-header";
import { DeleteButton, EditButton, ToggleAction } from "@/components/admin/row-actions";
import { formatRelative } from "@/lib/utils";
import { deleteProject, setProjectFeatured, setProjectPublished } from "@/server/actions/admin/projects";
import { listProjects } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Projects" };

export default async function AdminProjectsPage() {
  const projects = await listProjects();

  return (
    <>
      <PageHeader
        title="Projects"
        description="Case studies shown on your portfolio. Drafts stay private until published."
        actions={
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus aria-hidden="true" /> New project
            </Link>
          </Button>
        }
      />
      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first case study to showcase your work."
          action={
            <Button asChild>
              <Link href="/admin/projects/new">Create project</Link>
            </Button>
          }
        />
      ) : (
        <DataCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="hidden lg:table-cell">Updated</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative hidden h-10 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted sm:block">
                        {project.thumbnailUrl && (
                          <SmartImage src={project.thumbnailUrl} alt="" fill sizes="64px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/projects/${project.id}`} className="block truncate font-medium hover:text-brand">
                          {project.title}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">/{project.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary">{project.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <ToggleAction
                      checked={project.isPublished}
                      action={setProjectPublished.bind(null, project.id)}
                      label={`Publish ${project.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <ToggleAction
                      checked={project.isFeatured}
                      action={setProjectFeatured.bind(null, project.id)}
                      label={`Feature ${project.title}`}
                    />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">{formatRelative(project.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-0.5">
                      {project.isPublished && (
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link href={`/projects/${project.slug}`} target="_blank" aria-label={`View ${project.title} on site`}>
                            <ExternalLink />
                          </Link>
                        </Button>
                      )}
                      <EditButton href={`/admin/projects/${project.id}`} label={`Edit ${project.title}`} />
                      <DeleteButton
                        action={deleteProject.bind(null, project.id)}
                        itemName={`“${project.title}”`}
                        description="The project, its gallery and metrics will be permanently removed. Linked testimonials are kept."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataCard>
      )}
    </>
  );
}
