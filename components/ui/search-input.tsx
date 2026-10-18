import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchInputProps = {
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  name?: string;
};

export function SearchInput({
  placeholder = "Search anything…",
  className,
  defaultValue,
  name,
}: SearchInputProps) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">Search</span>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500"
        aria-hidden="true"
      />
      <input
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-neutral-200 bg-white pl-11 pr-16 text-body text-neutral-900 placeholder:text-neutral-500 focus:border-primary-400 focus:outline-none"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-sm border border-neutral-200 px-1.5 py-0.5 text-small font-medium text-neutral-500"
      >
        ⌘K
      </span>
    </label>
  );
}
