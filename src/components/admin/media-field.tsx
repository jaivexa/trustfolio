"use client";

import { useRef, useState } from "react";
import { FileText, ImageIcon, LoaderCircle, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { useFieldDefault, useFieldError } from "@/components/admin/entity-form";

export type UploadFolder = "projects" | "avatars" | "certificates" | "documents" | "testimonials" | "misc";

/** Uploads a file through the authenticated admin endpoint and returns its URL. */
export async function uploadFile(file: File, folder: UploadFolder): Promise<string> {
  const body = new FormData();
  body.set("file", file);
  body.set("folder", folder);
  const response = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!response.ok || !data.url) throw new Error(data.error ?? "Upload failed");
  return data.url;
}

const isImageUrl = (url: string) => /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(url);

/** URL input with upload button and live preview. Submits the URL under `name`. */
export function MediaField({
  name,
  label,
  description,
  defaultValue,
  folder,
  accept = "image/png,image/jpeg,image/webp,image/avif,image/gif",
  kind = "image",
  required,
}: {
  name: string;
  label: string;
  description?: string;
  defaultValue?: string | null;
  folder: UploadFolder;
  accept?: string;
  kind?: "image" | "document";
  required?: boolean;
}) {
  const errors = useFieldError(name);
  const initial = useFieldDefault(name, defaultValue);
  const [url, setUrl] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      setUrl(await uploadFile(file, folder));
      toast.success("File uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <FormField
      id={name}
      label={label}
      description={description ?? (kind === "image" ? "Upload an image or paste a URL." : "Upload a PDF or paste a URL.")}
      errors={errors}
      required={required}
    >
      {(props) => (
        <div className="flex items-start gap-3">
          <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border bg-muted">
            {url && kind === "image" && isImageUrl(url) ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin URLs, preview only
              <img src={url} alt="" className="size-full object-cover" />
            ) : kind === "document" && url ? (
              <FileText className="size-5 text-muted-foreground" aria-hidden="true" />
            ) : (
              <ImageIcon className="size-5 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div className="grid min-w-0 flex-1 gap-2">
            <Input {...props} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://… or /uploads/…" />
            <div className="flex gap-2">
              <input
                ref={fileInput}
                type="file"
                accept={accept}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => onFile(event.target.files?.[0])}
              />
              <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInput.current?.click()}>
                {uploading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
                {uploading ? "Uploading…" : "Upload"}
              </Button>
              {url && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setUrl("")}>
                  <X aria-hidden="true" /> Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </FormField>
  );
}
