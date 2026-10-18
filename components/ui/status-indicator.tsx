import { CircleCheck, Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusVariant =
  | "in-progress"
  | "completed"
  | "now-playing"
  | "locked";

const labels: Record<StatusVariant, string> = {
  "in-progress": "In Progress",
  completed: "Completed",
  "now-playing": "Now Playing",
  locked: "Locked",
};

export function StatusIndicator({
  status,
  label,
  className,
}: {
  status: StatusVariant;
  label?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <StatusIcon status={status} />
      <span className="text-body text-neutral-700">{label ?? labels[status]}</span>
    </span>
  );
}

function StatusIcon({ status }: { status: StatusVariant }) {
  if (status === "in-progress") {
    return (
      <svg
        viewBox="0 0 20 20"
        className="h-5 w-5 text-primary-500"
        aria-hidden="true"
      >
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="37.7 50.3"
          transform="rotate(-90 10 10)"
          opacity="0.35"
        />
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="37.7 50.3"
          transform="rotate(-90 10 10)"
        />
      </svg>
    );
  }

  if (status === "completed") {
    return (
      <CircleCheck className="h-5 w-5 text-success-500" aria-hidden="true" />
    );
  }

  if (status === "now-playing") {
    return (
      <PlayCircle
        className="h-5 w-5 text-primary-500 [&>circle]:fill-primary-500 [&>path]:stroke-white"
        aria-hidden="true"
      />
    );
  }

  return <Lock className="h-5 w-5 text-neutral-500" aria-hidden="true" />;
}
