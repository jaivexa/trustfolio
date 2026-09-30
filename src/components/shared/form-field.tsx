import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Label + control + description + error, wired together for assistive tech.
 * The child control should receive `id`, `aria-invalid` and `aria-describedby`
 * via the render prop.
 */
export function FormField({
  id,
  label,
  description,
  errors,
  required,
  className,
  children,
}: {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  errors?: string[];
  required?: boolean;
  className?: string;
  children: (props: {
    id: string;
    name: string;
    "aria-invalid": boolean | undefined;
    "aria-describedby": string | undefined;
    required?: boolean;
  }) => React.ReactNode;
}) {
  const error = errors?.[0];
  const describedBy = [description ? `${id}-description` : null, error ? `${id}-error` : null].filter(Boolean).join(" ");

  return (
    <div className={cn("grid content-start gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {children({
        id,
        name: id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
        required,
      })}
      {description && !error && (
        <p id={`${id}-description`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
