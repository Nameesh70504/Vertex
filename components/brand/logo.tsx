import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
};

export function Logo({
  className,
  markClassName,
  showWordmark = true,
  wordmarkClassName,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <VertexMark className={cn("h-8 w-8 text-primary-500", markClassName)} />
      {showWordmark ? (
        <span
          className={cn(
            "font-display text-heading-2 font-bold tracking-tight text-neutral-900",
            wordmarkClassName,
          )}
        >
          Vertex
        </span>
      ) : null}
    </span>
  );
}

function VertexMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M16 31 L1.5 3 H30.5 Z" fill="currentColor" />
      <path d="M16 22.5 L9.5 9.5 H22.5 Z" className="fill-white" />
    </svg>
  );
}
