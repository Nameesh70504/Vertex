import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "text";
export type ButtonSize = "lg" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md text-body font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-100 disabled:text-primary-300",
  secondary:
    "border border-primary-500 bg-white text-primary-500 hover:bg-primary-500 hover:text-white disabled:border-primary-200 disabled:text-primary-300",
  tertiary:
    "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 disabled:text-neutral-300",
  text: "bg-transparent text-primary-500 hover:text-primary-600 disabled:text-primary-300",
};

const sizes: Record<ButtonSize, string> = {
  lg: "h-11 px-4",
  md: "h-11 px-3",
};

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
} & (
  | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
);

export function Button({
  variant = "primary",
  size = "lg",
  className,
  href,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (href !== undefined) {
    return (
      <a
        href={href}
        className={classes}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      />
    );
  }

  return (
    <button
      type="button"
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    />
  );
}
