"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { useFieldDefault, useFieldError } from "@/components/admin/entity-form";
import { cn, slugify } from "@/lib/utils";

type BaseFieldProps = {
  name: string;
  label: string;
  description?: React.ReactNode;
  required?: boolean;
  className?: string;
};

export function TextField({
  name,
  label,
  description,
  required,
  className,
  defaultValue,
  type = "text",
  ...inputProps
}: BaseFieldProps & {
  defaultValue?: string | number | null;
  type?: "text" | "email" | "url" | "number" | "date" | "tel" | "password";
} & Omit<React.ComponentProps<"input">, "name" | "defaultValue" | "type">) {
  const errors = useFieldError(name);
  const value = useFieldDefault(name, defaultValue);
  return (
    <FormField id={name} label={label} description={description} errors={errors} required={required} className={className}>
      {(props) => (
        <Input
          {...props}
          {...inputProps}
          type={type}
          // Controlled when a `value` prop is passed (e.g. auto-generated slugs).
          {...(inputProps.value === undefined ? { defaultValue: value } : {})}
        />
      )}
    </FormField>
  );
}

export function TextareaField({
  name,
  label,
  description,
  required,
  className,
  defaultValue,
  rows = 4,
  ...textareaProps
}: BaseFieldProps & { defaultValue?: string | null; rows?: number } & Omit<
    React.ComponentProps<"textarea">,
    "name" | "defaultValue"
  >) {
  const errors = useFieldError(name);
  const value = useFieldDefault(name, defaultValue);
  return (
    <FormField id={name} label={label} description={description} errors={errors} required={required} className={className}>
      {(props) => <Textarea {...props} {...textareaProps} rows={rows} defaultValue={value} />}
    </FormField>
  );
}

/** One item per line; stored as a string array. */
export function ListField({
  defaultValue,
  ...props
}: BaseFieldProps & { defaultValue?: string[]; rows?: number; placeholder?: string }) {
  return (
    <TextareaField
      {...props}
      defaultValue={(defaultValue ?? []).join("\n")}
      description={props.description ?? "One item per line."}
    />
  );
}

export function DateField({ defaultValue, ...props }: BaseFieldProps & { defaultValue?: Date | string | null }) {
  const iso = defaultValue ? new Date(defaultValue).toISOString().slice(0, 10) : "";
  return <TextField {...props} type="date" defaultValue={iso} />;
}

export function SelectField({
  name,
  label,
  description,
  required,
  className,
  defaultValue,
  options,
  placeholder = "Select…",
}: BaseFieldProps & {
  defaultValue?: string | null;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
}) {
  const errors = useFieldError(name);
  const initial = useFieldDefault(name, defaultValue);
  const [value, setValue] = useState(initial);
  return (
    <FormField id={name} label={label} description={description} errors={errors} required={required} className={className}>
      {({ id, ...aria }) => (
        <Select name={name} value={value} onValueChange={setValue}>
          <SelectTrigger id={id} {...aria}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormField>
  );
}

export function SwitchField({
  name,
  label,
  description,
  defaultChecked = false,
  className,
}: Omit<BaseFieldProps, "required"> & { defaultChecked?: boolean }) {
  const id = useId();
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className={cn("flex items-start justify-between gap-4 rounded-xl border bg-background/50 p-4", className)}>
      <div className="grid gap-1">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {description && (
          <p id={`${id}-description`} className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <Switch
        id={id}
        name={name}
        checked={checked}
        onCheckedChange={setChecked}
        aria-describedby={description ? `${id}-description` : undefined}
      />
    </div>
  );
}

export function FieldGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 }) {
  return <div className={cn("grid gap-5", cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3")}>{children}</div>;
}

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft — not visible to the public" },
  { value: "PUBLISHED", label: "Published — visible on the website" },
  { value: "ARCHIVED", label: "Archived — hidden, kept for records" },
] as const;

export function StatusField({ defaultValue, description }: { defaultValue?: string | null; description?: React.ReactNode }) {
  return <SelectField name="status" label="Status" options={STATUS_OPTIONS} defaultValue={defaultValue ?? "DRAFT"} description={description} />;
}

/** Single optional relation (category, project, document…). Submits "none" for no selection. */
export function RelationSelect({
  options,
  defaultValue,
  noneLabel = "— None —",
  ...props
}: BaseFieldProps & {
  options: readonly { value: string; label: string; hint?: string }[];
  defaultValue?: string | null;
  noneLabel?: string;
}) {
  const withNone = [
    { value: "none", label: noneLabel },
    ...options.map((o) => ({ value: o.value, label: o.hint ? `${o.label} (${o.hint})` : o.label })),
  ];
  return <SelectField {...props} options={withNone} defaultValue={defaultValue ?? "none"} />;
}

/**
 * URL slug. For new records it follows the English title (`source` field)
 * until edited by hand.
 */
export function SlugField({
  defaultValue,
  source = "titleEn",
  prefix,
  label = "URL slug",
}: {
  defaultValue?: string | null;
  source?: string;
  prefix?: string;
  label?: string;
}) {
  const initial = useFieldDefault("slug", defaultValue);
  const [value, setValue] = useState(initial);
  const touched = useRef(Boolean(initial));
  const ref = useRef<HTMLInputElement>(null);
  const errors = useFieldError("slug");

  useEffect(() => {
    const form = ref.current?.form;
    if (!form) return;
    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement | null;
      if (target?.name === source && !touched.current) setValue(slugify(target.value).slice(0, 100));
    };
    form.addEventListener("input", onInput);
    return () => form.removeEventListener("input", onInput);
  }, [source]);

  return (
    <FormField
      id="slug"
      label={label}
      required
      errors={errors}
      description={
        <>
          Lowercase letters, numbers and hyphens.{prefix && <> Public address: <code className="text-foreground">/en{prefix}/{value || "…"}</code></>}
        </>
      }
    >
      {(props) => (
        <Input
          {...props}
          ref={ref}
          value={value}
          onChange={(event) => {
            touched.current = true;
            setValue(event.target.value.toLowerCase());
          }}
          autoComplete="off"
          spellCheck={false}
        />
      )}
    </FormField>
  );
}
