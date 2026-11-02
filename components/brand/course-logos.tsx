import { cn } from "@/lib/utils";

export function NextjsLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-lg bg-brand-nextjs",
        className,
      )}
      aria-label="Next.js"
      role="img"
    >
      <span className="font-sans text-[2.5rem] font-bold leading-none text-white">
        N
      </span>
    </div>
  );
}

export function TypeScriptLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-lg bg-brand-typescript",
        className,
      )}
      aria-label="TypeScript"
      role="img"
    >
      <span className="font-sans text-[1.875rem] font-bold leading-none text-white">
        TS
      </span>
    </div>
  );
}

export function DockerLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex h-[4.5rem] w-[4.5rem] items-center justify-center", className)}
      aria-label="Docker"
      role="img"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-16 w-16 text-brand-docker"
        aria-hidden="true"
        focusable="false"
      >
        <g fill="currentColor">
          <rect x="7" y="2.4" width="2.1" height="2.1" rx="0.4" />
          <rect x="9.4" y="2.4" width="2.1" height="2.1" rx="0.4" />
          <rect x="11.8" y="2.4" width="2.1" height="2.1" rx="0.4" />
          <rect x="4.6" y="5.1" width="2.1" height="2.1" rx="0.4" />
          <rect x="7" y="5.1" width="2.1" height="2.1" rx="0.4" />
          <rect x="9.4" y="5.1" width="2.1" height="2.1" rx="0.4" />
          <rect x="11.8" y="5.1" width="2.1" height="2.1" rx="0.4" />
          <rect x="14.2" y="5.1" width="2.1" height="2.1" rx="0.4" />
          <path d="M1.7 9.7 H18.1 c1.7 0 3.1 -0.7 4 -2 c0.4 1.3 0.1 2.6 -0.7 3.7 c-1.3 1.7 -3.4 2.6 -6 2.6 H8.2 c-3.3 0 -5.8 -1.7 -6.5 -4.3 Z" />
        </g>
        <circle cx="6.1" cy="11.6" r="0.7" fill="#ffffff" />
      </svg>
    </div>
  );
}
