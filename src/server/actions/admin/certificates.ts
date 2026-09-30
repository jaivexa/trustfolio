"use server";

import { db } from "@/lib/db";
import type { ActionState } from "@/lib/action-state";
import { CACHE_TAGS } from "@/lib/constants";
import { idSchema } from "@/lib/validations/common";
import { certificateSchema } from "@/lib/validations/content";
import { adminMutation, expire, logActivity, parseForm } from "@/server/actions/admin-helpers";

export async function saveCertificate(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(certificateSchema, formData);
  if (!parsed.ok) return parsed.state;

  return adminMutation(
    async (user) => {
      const row = id
        ? await db.certificate.update({ where: { id: idSchema.parse(id) }, data: parsed.data })
        : await db.certificate.create({ data: parsed.data });
      await logActivity(user, id ? "UPDATE" : "CREATE", "Certificate", row.id, `${id ? "Updated" : "Added"} certificate "${row.name}"`);
      expire(CACHE_TAGS.certificates);
      return { status: "success", message: id ? "Certificate saved" : "Certificate added", id: row.id };
    },
    { values: parsed.values },
  );
}

export async function setCertificatePublished(id: string, isPublished: boolean): Promise<ActionState> {
  return adminMutation(async (user) => {
    const row = await db.certificate.update({ where: { id: idSchema.parse(id) }, data: { isPublished } });
    await logActivity(user, isPublished ? "PUBLISH" : "UNPUBLISH", "Certificate", id, `${isPublished ? "Published" : "Hid"} "${row.name}"`);
    expire(CACHE_TAGS.certificates);
    return { status: "success", message: isPublished ? "Certificate published" : "Certificate hidden" };
  });
}

export async function deleteCertificate(id: string): Promise<ActionState> {
  return adminMutation(async (user) => {
    const row = await db.certificate.delete({ where: { id: idSchema.parse(id) } });
    await logActivity(user, "DELETE", "Certificate", id, `Deleted certificate "${row.name}"`);
    expire(CACHE_TAGS.certificates);
    return { status: "success", message: "Certificate deleted" };
  });
}
