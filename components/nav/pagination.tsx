import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaginationProps = {
  current: number;
  total: number;
  className?: string;
  hrefFor?: (page: number) => string;
};

function getPages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (page - previous > 1) result.push("ellipsis");
    result.push(page);
    previous = page;
  }
  return result;
}

export function Pagination({
  current,
  total,
  className,
  hrefFor,
}: PaginationProps) {
  const pages = getPages(current, total);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center gap-2", className)}
    >
      <PaginationLink
        href={hrefFor?.(current - 1)}
        disabled={current <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </PaginationLink>

      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1 text-body text-neutral-500"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <PaginationLink
            key={page}
            href={hrefFor?.(page)}
            current={page === current}
          >
            {page}
          </PaginationLink>
        ),
      )}

      <PaginationLink
        href={hrefFor?.(current + 1)}
        disabled={current >= total}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  children,
  href,
  current = false,
  disabled = false,
  ...props
}: {
  children: React.ReactNode;
  href?: string;
  current?: boolean;
  disabled?: boolean;
} & React.AriaAttributes) {
  const classes = cn(
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-body font-medium transition-colors",
    current
      ? "border border-primary-500 text-primary-500"
      : "text-neutral-700 hover:bg-neutral-100",
    disabled && "pointer-events-none opacity-40",
  );

  if (href) {
    return (
      <a
        href={href}
        aria-current={current ? "page" : undefined}
        className={classes}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={current ? "page" : undefined}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
