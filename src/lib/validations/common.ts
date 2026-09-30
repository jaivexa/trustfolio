import { z } from "zod";

/** Treat blank strings from form inputs as `null`. */
export const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

export const requiredText = (label: string, max: number, min = 1) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(min, min > 1 ? `${label} must be at least ${min} characters` : `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

export const optionalText = (max: number) =>
  z.preprocess(emptyToNull, z.string().trim().max(max, `Must be at most ${max} characters`).nullable());

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

/** Absolute http(s) URL. */
export const optionalUrl = z.preprocess(
  emptyToNull,
  z.string().trim().max(2048).refine(isHttpUrl, "Enter a valid http(s) URL").nullable(),
);

/** Absolute http(s) URL or a site-relative path (e.g. `/uploads/x.png`). */
export const mediaUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) => isHttpUrl(value) || (value.startsWith("/") && !value.startsWith("//")),
    "Enter a valid URL or site path",
  );

export const optionalMediaUrl = z.preprocess(emptyToNull, mediaUrl.nullable());

/** Link targets for CTAs: in-page anchors, site paths, mailto or http(s). */
export const linkHref = z
  .string()
  .trim()
  .min(1, "Link is required")
  .max(2048)
  .refine(
    (value) =>
      value.startsWith("#") ||
      (value.startsWith("/") && !value.startsWith("//")) ||
      value.startsWith("mailto:") ||
      isHttpUrl(value),
    "Use #anchor, /path, mailto: or an http(s) URL",
  );

export const checkbox = z.preprocess(
  (value) => value === true || value === "on" || value === "true",
  z.boolean(),
);

export const optionalDate = z.preprocess(emptyToNull, z.coerce.date({ error: "Enter a valid date" }).nullable());

export const requiredDate = (label: string) => z.coerce.date({ error: `${label} is required` });

export const optionalInt = (min = 0, max = 1_000_000) =>
  z.preprocess(emptyToNull, z.coerce.number().int().min(min).max(max).nullable());

export const sortOrder = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? 0 : value),
  z.coerce.number().int().min(0).max(10_000),
);

/** Newline-separated textarea → trimmed string array. */
export const lines = (maxItems: number, maxLength = 300) =>
  z.preprocess(
    (value) =>
      typeof value === "string"
        ? value
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
        : value,
    z
      .array(z.string().max(maxLength, `Each line must be at most ${maxLength} characters`))
      .max(maxItems, `At most ${maxItems} items`),
  );

/** Comma-separated input → unique trimmed string array. */
export const commaList = (maxItems: number, maxLength = 60) =>
  z.preprocess(
    (value) =>
      typeof value === "string"
        ? Array.from(
            new Set(
              value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            ),
          )
        : value,
    z.array(z.string().max(maxLength)).max(maxItems, `At most ${maxItems} items`),
  );

/** Hidden input carrying JSON produced by a client-side editor. */
export const jsonField = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;
    if (value.trim() === "") return [];
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return Symbol.for("invalid-json");
    }
  }, schema);

export const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "Slug must be at least 2 characters")
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");

export const idSchema = z.string().min(1).max(64);
