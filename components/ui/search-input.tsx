import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchInputSize = "md" | "lg";

const sizes: Record<
  SearchInputSize,
  { input: string; icon: string; chip: string }
> = {
  md: {
    input: "h-11 rounded-md pl-11 pr-16 text-body",
    icon: "left-4 h-5 w-5",
    chip: "right-3 px-1.5 py-0.5 text-small",
  },
  lg: {
    input: "h-16 rounded-lg pl-14 pr-24 text-[1.0625rem]",
    icon: "left-5 h-6 w-6",
    chip: "right-4 px-2.5 py-1 text-small",
  },
};

export type SearchInputProps = {
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  name?: string;
  size?: SearchInputSize;
};

export function SearchInput({
  placeholder = "Search anything…",
  className,
  defaultValue,
  name = "q",
  size = "md",
}: SearchInputProps) {
  const s = sizes[size];

  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">Search</span>
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-neutral-500",
          s.icon,
        )}
        aria-hidden="true"
      />
      <input
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cn(
          "w-full border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-500 focus:border-primary-400 focus:outline-none",
          s.input,
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-sm border border-neutral-200 font-medium text-neutral-500",
          s.chip,
        )}
      >
        ⌘K
      </span>
    </label>
  );
}
