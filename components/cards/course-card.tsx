import { BarChart3, Clock, LayoutGrid } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type CourseCardProps = {
  title: string;
  description: string;
  logo?: React.ReactNode;
  logoText?: string;
  level: string;
  duration: string;
  modules: string;
  href?: string;
  className?: string;
  progressPercent?: number;
};

export function CourseCard({
  title,
  description,
  logo,
  logoText = "N",
  level,
  duration,
  modules,
  href,
  className,
  progressPercent,
}: CourseCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="mb-6">
        {logo ?? (
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-neutral-900 text-heading-3 font-semibold text-white">
            {logoText}
          </div>
        )}
      </div>
      <h3 className="font-display text-heading-2 text-neutral-900">
        {href ? (
          <a href={href} className="hover:text-primary-500">
            {title}
          </a>
        ) : (
          title
        )}
      </h3>
      <p className="mt-2 text-body text-neutral-500">{description}</p>
      <div className="mt-auto pt-6">
        {typeof progressPercent === 'number' && progressPercent > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
              <span>Your progress</span>
              <span className="font-semibold text-primary-600">{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-neutral-200 pt-4 text-small text-neutral-500">
          <MetaItem icon={<BarChart3 />} label={level} />
          <MetaItem icon={<Clock />} label={duration} />
          <MetaItem icon={<LayoutGrid />} label={modules} />
        </div>
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
