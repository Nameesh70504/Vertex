import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  href: string;
  active?: boolean;
};

export type NavbarProps = {
  items?: NavItem[];
  className?: string;
  right?: React.ReactNode;
};

const defaultItems: NavItem[] = [
  { label: "Courses", href: "#", active: true },
  { label: "My Learning", href: "#" },
];

export function Navbar({ items = defaultItems, className, right }: NavbarProps) {
  return (
    <nav
      className={cn(
        "flex items-center justify-between gap-6 border-b border-neutral-200 px-6 py-4",
        className,
      )}
    >
      <Logo />
      <div className="flex items-center gap-6">
        <ul className="flex items-center gap-6">
          {items.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "text-body font-medium",
                  item.active
                    ? "text-primary-500"
                    : "text-neutral-900 hover:text-primary-500",
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        {right}
      </div>
    </nav>
  );
}
