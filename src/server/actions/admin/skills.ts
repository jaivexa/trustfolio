"use server";

import { db } from "@/lib/db";
import type { ActionState } from "@/lib/action-state";
import { CACHE_TAGS } from "@/lib/constants";
import { idSchema } from "@/lib/validations/common";
import { skillSchema } from "@/lib/validations/content";
import { adminMutation, expire, logActivity, parseForm } from "@/server/actions/admin-helpers";

export async function saveSkill(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(skillSchema, formData);
  if (!parsed.ok) return parsed.state;

  return adminMutation(
    async (user) => {
      const skill = id
        ? await db.skill.update({ where: { id: idSchema.parse(id) }, data: parsed.data })
        : await db.skill.create({ data: parsed.data });
      await logActivity(user, id ? "UPDATE" : "CREATE", "Skill", skill.id, `${id ? "Updated" : "Added"} skill "${skill.name}"`);
      expire(CACHE_TAGS.skills);
      return { status: "success", message: id ? "Skill saved" : "Skill added", id: skill.id };
    },
    { values: parsed.values },
  );
}

export async function deleteSkill(id: string): Promise<ActionState> {
  return adminMutation(async (user) => {
    const skill = await db.skill.delete({ where: { id: idSchema.parse(id) } });
    await logActivity(user, "DELETE", "Skill", id, `Deleted skill "${skill.name}"`);
    expire(CACHE_TAGS.skills);
    return { status: "success", message: "Skill deleted" };
  });
}
