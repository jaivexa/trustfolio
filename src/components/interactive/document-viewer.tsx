"use client";

import { useEffect, useRef, useState } from "react";
import { Download, ExternalLink, FileText, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ViewerLabels = {
  preview: string;
  fullscreen: string;
  exitFullscreen: string;
  download: string;
  openInNewTab: string;
  page: string;
  previewUnavailable: string;
};

/**
 * Professional document viewer. PDFs use the browser's native renderer via
 * <object> (with a real fallback on devices that can't embed PDFs, e.g. most
 * phones); images render inline. Fullscreen uses the Fullscreen API.
 */
export function DocumentViewer({
  file,
  title,
  titleLang,
  labels,
}: {
  file: { url: string; mimeType: string; filename: string };
  title: string;
  titleLang?: string;
  labels: ViewerLabels;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [page, setPage] = useState(1);
  const isPdf = file.mimeType === "application/pdf";
  const isImage = file.mimeType.startsWith("image/");

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await frameRef.current?.requestFullscreen?.().catch(() => undefined);
  };

  const fallback = (
    <div className="grid h-full min-h-72 place-items-center p-8 text-center">
      <div className="max-w-sm">
        <FileText className="mx-auto size-10 text-brand/60" aria-hidden="true" />
        <p className="mt-4 text-sm text-muted-foreground">{labels.previewUnavailable}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden="true" /> {labels.openInNewTab}
            </a>
          </Button>
          <Button asChild size="sm">
            <a href={file.url} download={file.filename}>
              <Download aria-hidden="true" /> {labels.download}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <section aria-label={labels.preview} className="overflow-hidden rounded-2xl border bg-card shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2 sm:px-4">
        <p lang={titleLang} className="min-w-0 truncate text-sm font-medium">
          {title}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {isPdf && (
            <label className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              {labels.page}
              <Input
                type="number"
                min={1}
                value={page}
                onChange={(event) => setPage(Math.max(1, Number(event.target.value) || 1))}
                className="h-8 w-16 rounded-lg px-2 text-center"
              />
            </label>
          )}
          <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="hidden sm:inline-flex">
            {fullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
            {fullscreen ? labels.exitFullscreen : labels.fullscreen}
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href={file.url} target="_blank" rel="noopener noreferrer" aria-label={labels.openInNewTab}>
              <ExternalLink aria-hidden="true" />
              <span className="hidden sm:inline">{labels.openInNewTab}</span>
            </a>
          </Button>
          <Button asChild size="sm">
            <a href={file.url} download={file.filename}>
              <Download aria-hidden="true" /> {labels.download}
            </a>
          </Button>
        </div>
      </div>
      <div ref={frameRef} className="bg-muted/30 [&:fullscreen]:bg-background">
        {isPdf ? (
          <object
            key={page}
            data={`${file.url}#page=${page}&view=FitH`}
            type="application/pdf"
            aria-label={title}
            className="block h-[70vh] min-h-96 w-full [:fullscreen_&]:h-dvh"
          >
            {fallback}
          </object>
        ) : isImage ? (
          <div className="grid place-items-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- document scans of arbitrary size, viewed at native resolution */}
            <img src={file.url} alt={title} className="max-h-[75vh] w-auto rounded-lg object-contain" />
          </div>
        ) : (
          fallback
        )}
      </div>
    </section>
  );
}
