import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = {
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  className?: string;
  name?: string;
  defaultValue?: string;
};

export function Select({
  options,
  placeholder,
  label = "Select",
  className,
  name,
  defaultValue,
}: SelectProps) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="h-11 w-full appearance-none rounded-md border border-neutral-200 bg-white pl-4 pr-10 text-body text-neutral-900 focus:border-primary-400 focus:outline-none"
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
        aria-hidden="true"
      />
    </label>
  );
}
