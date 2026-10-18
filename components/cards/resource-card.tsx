import { ExternalLink, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ResourceCardProps = {
  title: string;
  description: string;
  fileType: string;
  fileSize: string;
  href?: string;
  className?: string;
};

export function ResourceCard({
  title,
  description,
  fileType,
  fileSize,
  href,
  className,
}: ResourceCardProps) {
  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-neutral-700">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h3 className="text-heading-3 text-neutral-900">{title}</h3>
          <p className="text-body text-neutral-500">{description}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <span className="text-small text-neutral-500">
          {fileType} · {fileSize}
        </span>
        <a
          href={href}
          aria-label={`Open ${title}`}
          className="inline-flex items-center text-primary-500 hover:text-primary-600"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </Card>
  );
}
