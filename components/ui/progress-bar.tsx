import { cn } from "@/lib/utils";

export type ProgressBarProps = {
  value: number;
  max?: number;
  showLabel?: boolean;
  className?: string;
};

export function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const percent = Math.round((clamped / max) * 100);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-2 w-full overflow-hidden rounded-full bg-neutral-100"
      >
        <div
          className="h-full rounded-full bg-primary-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel ? (
        <span className="shrink-0 text-small text-neutral-500">
          {percent}% complete
        </span>
      ) : null}
    </div>
  );
}
