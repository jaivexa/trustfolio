import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/category-manager";
import { PageHeader } from "@/components/admin/page-header";
import { listCategories } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await listCategories();
  return (
    <>
      <PageHeader title="Categories" description="Used for public filters. Each category has an English and a Tamil name." />
      <CategoryManager categories={categories} />
    </>
  );
}
