import { PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type LessonVideoCardProps = {
  title: string;
  description: string;
  lessonLabel: string;
  duration: string;
  watchFrom: string;
  href?: string;
  className?: string;
};

export function LessonVideoCard({
  title,
  description,
  lessonLabel,
  duration,
  watchFrom,
  href,
  className,
}: LessonVideoCardProps) {
  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <Badge variant="video">Video</Badge>
      <h3 className="text-heading-3 text-neutral-900">{title}</h3>
      <p className="text-body text-neutral-500">{description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <span className="text-small text-neutral-500">
          {lessonLabel} · {duration}
        </span>
        <a
          href={href}
          className="inline-flex items-center gap-1.5 text-body font-medium text-primary-500 hover:text-primary-600"
        >
          <PlayCircle className="h-5 w-5" aria-hidden="true" />
          Watch from {watchFrom}
        </a>
      </div>
    </Card>
  );
}
