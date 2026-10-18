import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type LessonCardProps = {
  title: string;
  description: string;
  moduleLabel: string;
  href?: string;
  className?: string;
};

export function LessonCard({
  title,
  description,
  moduleLabel,
  href,
  className,
}: LessonCardProps) {
  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <Badge variant="lesson">Lesson</Badge>
      <h3 className="text-heading-3 text-neutral-900">{title}</h3>
      <p className="text-body text-neutral-500">{description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <span className="text-small text-neutral-500">{moduleLabel}</span>
        <a
          href={href}
          className="inline-flex items-center gap-1.5 text-body font-medium text-primary-500 hover:text-primary-600"
        >
          View lesson
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </Card>
  );
}
