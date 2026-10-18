import { BarChart3, Clock, LayoutGrid } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type CourseCardProps = {
  title: string;
  description: string;
  logoText?: string;
  level: string;
  duration: string;
  modules: string;
  href?: string;
  className?: string;
};

export function CourseCard({
  title,
  description,
  logoText = "N",
  level,
  duration,
  modules,
  href,
  className,
}: CourseCardProps) {
  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-heading-3 font-semibold text-white">
          {logoText}
        </div>
        <div className="space-y-1">
          <h3 className="text-heading-3 text-neutral-900">
            {href ? (
              <a href={href} className="hover:text-primary-500">
                {title}
              </a>
            ) : (
              title
            )}
          </h3>
          <p className="text-body text-neutral-500">{description}</p>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-small text-neutral-500">
        <MetaItem icon={<BarChart3 />} label={level} />
        <MetaItem icon={<Clock />} label={duration} />
        <MetaItem icon={<LayoutGrid />} label={modules} />
      </div>
    </Card>
  );
}

function MetaItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="[&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">
        {icon}
      </span>
      {label}
    </span>
  );
}
