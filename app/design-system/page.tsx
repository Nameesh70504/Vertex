import {
  Accessibility,
  AppWindow,
  BarChart3,
  Bell,
  ChevronRight,
  Clock,
  Crosshair,
  ExternalLink,
  Eye,
  FileText,
  LayoutGrid,
  PlayCircle,
  Search,
  User,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";

import {
  CourseCard,
} from "@/components/cards/course-card";

import { LessonCard } from "@/components/cards/lesson-card";
import { LessonVideoCard } from "@/components/cards/lesson-video-card";
import { ResourceCard } from "@/components/cards/resource-card";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { Navbar } from "@/components/nav/navbar";
import { Pagination } from "@/components/nav/pagination";
import { Badge } from "@/components/ui/badge";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { cn } from "@/lib/utils";

export default function DesignSystemPage() {
  return (
    <main className="flex-1 bg-neutral-50 px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex max-w-[77.5rem] flex-col gap-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <HeaderCard />
          <ColorsSection />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <TypographySection />
          <TypeScaleSection />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <SpacingSection />
          <RadiusShadowSection />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <IconsSection />
          <ButtonsSection />
          <InputsSection />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <BadgesSection />
          <StatusSection />
          <ProgressSection />
        </div>

        <CardsSection />
        <NavigationSection />
        <PrinciplesSection />
      </div>
    </main>
  );
}

function SheetSection({
  number,
  title,
  className,
  children,
}: {
  number: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-neutral-200 bg-white p-6 sm:p-8",
        className,
      )}
    >
      <h2 className="mb-6 flex items-center gap-2 text-small font-semibold uppercase tracking-wider">
        <span className="text-primary-500">{number}</span>
        <span className="text-neutral-900">{title}</span>
      </h2>
      {children}
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-body font-medium text-neutral-900">{children}</h3>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-small text-neutral-500">
      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-300" />
      {children}
    </li>
  );
}

function HeaderCard() {
  return (
    <section className="flex flex-col justify-between gap-8 rounded-lg border border-neutral-200 bg-white p-8 sm:p-10">
      <Logo className="gap-3 [&_svg]:h-10 [&_svg]:w-10" />
      <div className="space-y-3">
        <h1 className="text-display-1 text-neutral-900">Design System</h1>
        <p className="max-w-md text-body-large text-neutral-500">
          A unified design language for Vertex learning platform. Clean, modern
          and focused on clarity, consistency and intuitive learning
          experiences.
        </p>
      </div>
      <p className="text-small font-medium uppercase tracking-wider text-neutral-500">
        Version 1.0 · May 2025
      </p>
    </section>
  );
}

const primarySwatches = [
  { name: "Primary 500", hex: "#F97316" },
  { name: "Primary 400", hex: "#FB923C" },
  { name: "Primary 300", hex: "#FDBA74" },
  { name: "Primary 200", hex: "#FED7AA" },
  { name: "Primary 100", hex: "#FFEEE5" },
];

const neutralSwatches = [
  { name: "Neutral 900", hex: "#0F172A" },
  { name: "Neutral 700", hex: "#334155" },
  { name: "Neutral 500", hex: "#64748B" },
  { name: "Neutral 300", hex: "#CBD5E1" },
  { name: "Neutral 200", hex: "#E2E8F0" },
  { name: "Neutral 100", hex: "#F1F5F9" },
  { name: "Neutral 50", hex: "#FAFAFC" },
  { name: "White", hex: "#FFFFFF" },
];

function ColorsSection() {
  return (
    <SheetSection number="01" title="Colors">
      <div className="space-y-8">
        <div>
          <SubHeading>Primary</SubHeading>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {primarySwatches.map((swatch) => (
              <Swatch key={swatch.hex} {...swatch} />
            ))}
          </div>
        </div>
        <div>
          <SubHeading>Neutral</SubHeading>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {neutralSwatches.map((swatch) => (
              <Swatch key={swatch.hex} {...swatch} bordered />
            ))}
          </div>
        </div>
      </div>
    </SheetSection>
  );
}

function Swatch({
  name,
  hex,
  bordered = false,
}: {
  name: string;
  hex: string;
  bordered?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div
        className={cn("h-16 w-full rounded-md", bordered && "border border-neutral-200")}
        style={{ backgroundColor: hex }}
      />
      <div className="space-y-0.5">
        <p className="text-small font-medium text-neutral-900">{name}</p>
        <p className="font-mono text-small text-neutral-500">{hex}</p>
      </div>
    </div>
  );
}

function TypographySection() {
  return (
    <SheetSection number="02" title="Typography">
      <div className="space-y-8">
        <div className="flex items-center gap-6">
          <span className="font-display text-[4rem] leading-none text-neutral-900">
            Ag
          </span>
          <div>
            <p className="text-heading-3 text-neutral-900">Playfair Display</p>
            <p className="text-small text-neutral-500">
              Elegant · Readable · Timeless
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[4rem] leading-none text-neutral-900">Ag</span>
          <div>
            <p className="text-heading-3 text-neutral-900">Inter</p>
            <p className="text-small text-neutral-500">
              Clean · Modern · Highly legible
            </p>
          </div>
        </div>
      </div>
    </SheetSection>
  );
}

const typeScale = [
  { style: "Display 1", cls: "text-display-1", font: "Playfair Display", size: "48 / 56", weight: "Bold", use: "Page titles" },
  { style: "Display 2", cls: "text-display-2", font: "Playfair Display", size: "36 / 44", weight: "Bold", use: "Section titles" },
  { style: "Heading 1", cls: "text-heading-1", font: "Inter", size: "28 / 36", weight: "Semi Bold", use: "Card titles" },
  { style: "Heading 2", cls: "text-heading-2", font: "Inter", size: "22 / 30", weight: "Semi Bold", use: "Sub section" },
  { style: "Heading 3", cls: "text-heading-3", font: "Inter", size: "18 / 26", weight: "Medium", use: "Small titles" },
  { style: "Body Large", cls: "text-body-large", font: "Inter", size: "16 / 24", weight: "Regular", use: "Body copy" },
  { style: "Body", cls: "text-body", font: "Inter", size: "14 / 20", weight: "Regular", use: "Supporting text" },
  { style: "Small", cls: "text-small", font: "Inter", size: "12 / 16", weight: "Regular", use: "Captions, meta" },
];

function TypeScaleSection() {
  return (
    <SheetSection number="03" title="Type Scale" className="lg:col-span-2">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[35rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-neutral-200 text-small text-neutral-500">
              <th className="py-2 pr-4 font-normal">Style</th>
              <th className="py-2 pr-4 font-normal">Font</th>
              <th className="py-2 pr-4 font-normal">Size / Line Height</th>
              <th className="py-2 pr-4 font-normal">Weight</th>
              <th className="py-2 font-normal">Use</th>
            </tr>
          </thead>
          <tbody>
            {typeScale.map((row) => (
              <tr key={row.style} className="border-b border-neutral-100 last:border-0">
                <td className={cn("py-3 pr-4 text-neutral-900", row.cls)}>
                  {row.style}
                </td>
                <td className="py-3 pr-4 text-body text-neutral-500">{row.font}</td>
                <td className="py-3 pr-4 text-body text-neutral-500">{row.size}</td>
                <td className="py-3 pr-4 text-body text-neutral-500">{row.weight}</td>
                <td className="py-3 text-body text-neutral-500">{row.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SheetSection>
  );
}

const spacing = [
  { px: 4, rem: "0.25rem" },
  { px: 8, rem: "0.5rem" },
  { px: 12, rem: "0.75rem" },
  { px: 16, rem: "1rem" },
  { px: 24, rem: "1.5rem" },
  { px: 32, rem: "2rem" },
  { px: 40, rem: "2.5rem" },
  { px: 48, rem: "3rem" },
  { px: 64, rem: "4rem" },
];

function SpacingSection() {
  return (
    <SheetSection number="04" title="Spacing System">
      <p className="mb-6 text-body text-neutral-500">
        Base unit: <span className="font-medium text-neutral-900">4px</span>
      </p>
      <div className="flex flex-wrap items-end gap-5">
        {spacing.map((item) => (
          <div key={item.px} className="flex flex-col items-center gap-2">
            <div
              className="rounded-sm bg-primary-200"
              style={{ width: item.px, height: item.px }}
            />
            <div className="text-center">
              <p className="text-small font-medium text-neutral-900">{item.px}</p>
              <p className="text-small text-neutral-500">({item.rem})</p>
            </div>
          </div>
        ))}
      </div>
    </SheetSection>
  );
}

const radii = [
  { label: "4px", sub: "(xs)", cls: "rounded-xs" },
  { label: "8px", sub: "(sm)", cls: "rounded-sm" },
  { label: "12px", sub: "(md)", cls: "rounded-md" },
  { label: "16px", sub: "(lg)", cls: "rounded-lg" },
  { label: "24px", sub: "(xl)", cls: "rounded-xl" },
  { label: "Full", sub: "(circle)", cls: "rounded-full" },
];

const shadows = [
  { label: "Sm", cls: "shadow-sm", value: "0 1px 2px 0 rgba(15, 23, 42, 0.05)" },
  { label: "Md", cls: "shadow-md", value: "0 4px 12px -2px rgba(15, 23, 42, 0.08)" },
  { label: "Lg", cls: "shadow-lg", value: "0 12px 24px -4px rgba(15, 23, 42, 0.10)" },
  { label: "Xl", cls: "shadow-xl", value: "0 20px 40px -8px rgba(15, 23, 42, 0.12)" },
];

function RadiusShadowSection() {
  return (
    <SheetSection number="05" title="Radius & Shadows">
      <div className="space-y-8">
        <div>
          <SubHeading>Radius</SubHeading>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {radii.map((radius) => (
              <div key={radius.label} className="space-y-2 text-center">
                <div
                  className={cn(
                    "h-14 w-full border border-neutral-200 bg-white",
                    radius.cls,
                  )}
                />
                <p className="text-small text-neutral-900">
                  {radius.label}{" "}
                  <span className="text-neutral-500">{radius.sub}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SubHeading>Shadows</SubHeading>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {shadows.map((shadow) => (
              <div
                key={shadow.label}
                className={cn("rounded-lg bg-white p-4", shadow.cls)}
              >
                <p className="text-body font-medium text-neutral-900">
                  {shadow.label}
                </p>
                <p className="mt-1 break-words font-mono text-[0.625rem] leading-snug text-neutral-500">
                  {shadow.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SheetSection>
  );
}

const outlineIcons = [Bell, Search, PlayCircle, FileText, AppWindow, BarChart3, Clock, User];
const filledIcons = [Bell, Search, PlayCircle, FileText, AppWindow, BarChart3, Clock, User];

function IconsSection() {
  return (
    <SheetSection number="06" title="Icons">
      <div className="space-y-6">
        <div>
          <SubHeading>Outline Style</SubHeading>
          <div className="flex flex-wrap items-center gap-4 text-neutral-900">
            {outlineIcons.map((Icon, index) => (
              <Icon key={index} className="h-6 w-6" aria-hidden="true" />
            ))}
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
        <div>
          <SubHeading>Filled Style</SubHeading>
          <div className="flex flex-wrap items-center gap-4 text-neutral-900">
            {filledIcons.map((Icon, index) => (
              <Icon
                key={index}
                className="h-6 w-6 fill-current"
                aria-hidden="true"
              />
            ))}
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
        <div>
          <SubHeading>Icon Specs</SubHeading>
          <ul className="space-y-1.5">
            <Bullet>24×24px grid</Bullet>
            <Bullet>2px stroke width (outline)</Bullet>
            <Bullet>Rounded line caps</Bullet>
            <Bullet>Consistent optical balance</Bullet>
          </ul>
        </div>
      </div>
    </SheetSection>
  );
}

const buttonVariants: ButtonVariant[] = ["primary", "secondary", "tertiary", "text"];
const variantLabels: Record<ButtonVariant, string> = {
  primary: "Primary",
  secondary: "Secondary",
  tertiary: "Tertiary",
  text: "Text",
};

const hoverClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary-600",
  secondary: "border-primary-500 bg-primary-500 text-white",
  tertiary: "bg-neutral-50",
  text: "text-primary-600",
};

function ButtonLabel({ variant }: { variant: ButtonVariant }) {
  if (variant === "primary") return <>Get Started</>;
  if (variant === "secondary") return <>Explore Courses</>;
  if (variant === "tertiary")
    return (
      <>
        View Lesson
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </>
    );
  return (
    <>
      Watch Video
      <PlayCircle className="h-5 w-5" aria-hidden="true" />
    </>
  );
}

function ButtonsSection() {
  return (
    <SheetSection number="07" title="Buttons">
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[26.25rem] border-collapse text-left">
            <thead>
              <tr className="text-body text-neutral-500">
                <th className="pb-3 pr-4 font-normal" />
                {buttonVariants.map((variant) => (
                  <th key={variant} className="pb-3 pr-4 font-normal">
                    {variantLabels[variant]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["Default", "Hover", "Disabled"] as const).map((state) => (
                <tr key={state}>
                  <td className="py-2.5 pr-4 text-body text-neutral-900">{state}</td>
                  {buttonVariants.map((variant) => (
                    <td key={variant} className="py-2.5 pr-4">
                      <Button
                        variant={variant}
                        disabled={state === "Disabled"}
                        className={state === "Hover" ? hoverClasses[variant] : undefined}
                      >
                        <ButtonLabel variant={variant} />
                      </Button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <SubHeading>Button Specs</SubHeading>
          <ul className="space-y-1.5">
            <Bullet>Height: 44px (default)</Bullet>
            <Bullet>Padding: 0 16px (lg), 0 12px (md)</Bullet>
            <Bullet>Radius: 12px</Bullet>
            <Bullet>Font: Inter Medium (14–16px)</Bullet>
          </ul>
        </div>
      </div>
    </SheetSection>
  );
}

function InputsSection() {
  return (
    <SheetSection number="08" title="Inputs">
      <div className="space-y-6">
        <div>
          <SubHeading>Search / Text Input</SubHeading>
          <SearchInput />
        </div>
        <div>
          <SubHeading>Select</SubHeading>
          <Select
            placeholder="Most Relevant"
            label="Sort"
            defaultValue="relevant"
            options={[
              { value: "relevant", label: "Most Relevant" },
              { value: "recent", label: "Most Recent" },
              { value: "popular", label: "Most Popular" },
            ]}
          />
        </div>
        <div>
          <SubHeading>Field Specs</SubHeading>
          <ul className="space-y-1.5">
            <Bullet>Height: 44px</Bullet>
            <Bullet>Radius: 12px</Bullet>
            <Bullet>Border: 1px solid #E2E8F0</Bullet>
            <Bullet>Padding: 0 16px</Bullet>
            <Bullet>Focus: border color #FB923C</Bullet>
          </ul>
        </div>
      </div>
    </SheetSection>
  );
}

function BadgesSection() {
  return (
    <SheetSection number="09" title="Badges / Tags">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-3">
          <p className="text-small text-neutral-500">Video</p>
          <Badge variant="video">Video</Badge>
        </div>
        <div className="space-y-3">
          <p className="text-small text-neutral-500">Lesson</p>
          <Badge variant="lesson">Lesson</Badge>
        </div>
        <div className="space-y-3">
          <p className="text-small text-neutral-500">Popular</p>
          <Badge variant="popular">Popular</Badge>
        </div>
      </div>
    </SheetSection>
  );
}

function StatusSection() {
  return (
    <SheetSection number="10" title="Status / Indicators">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <StatusIndicator status="in-progress" />
        <StatusIndicator status="completed" />
        <StatusIndicator status="now-playing" />
        <StatusIndicator status="locked" />
      </div>
    </SheetSection>
  );
}

function ProgressSection() {
  return (
    <SheetSection number="11" title="Progress Bar">
      <ProgressBar value={35} />
    </SheetSection>
  );
}

function CardsSection() {
  return (
    <SheetSection number="12" title="Cards">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-3">
          <p className="text-small text-neutral-500">Course Card</p>
          <CourseCard
            title="Next.js for Production"
            description="Build scalable, high-performance web applications with Next.js."
            level="Intermediate"
            duration="18h 24m"
            modules="12 modules"
            href="#"
            className="h-full"
          />
        </div>
        <div className="space-y-3">
          <p className="text-small text-neutral-500">Lesson Card (Video)</p>
          <LessonVideoCard
            title="Data Fetching in Server Components"
            description="Learn how to fetch data on the server using async/await and Next.js best practices."
            lessonLabel="Lesson 5.1"
            duration="12:45"
            watchFrom="12:45"
            href="#"
            className="h-full"
          />
        </div>
        <div className="space-y-3">
          <p className="text-small text-neutral-500">Lesson Card (Lesson)</p>
          <LessonCard
            title="Data Fetching & Caching"
            description="Explore different data fetching methods in Next.js and how to cache and revalidate data for optimal performance."
            moduleLabel="Module 5"
            href="#"
            className="h-full"
          />
        </div>
        <div className="space-y-3">
          <p className="text-small text-neutral-500">Resource Card</p>
          <ResourceCard
            title="Caching and Revalidation Guide"
            description="Deep dive into Next.js caching strategies."
            fileType="PDF"
            fileSize="1.2 MB"
            href="#"
            className="h-full"
          />
        </div>
      </div>
    </SheetSection>
  );
}

function NavigationSection() {
  return (
    <SheetSection number="13" title="Navigation">
      <Navbar className="mb-8 -mx-6 border-y border-neutral-200 px-6 sm:-mx-8 sm:px-8" />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-small text-neutral-500">Breadcrumbs</p>
          <Breadcrumbs
            items={[
              { label: "All Courses", href: "#" },
              { label: "Next.js for Production", href: "#" },
              { label: "Data Fetching & Caching" },
            ]}
          />
        </div>
        <div className="space-y-3 md:justify-self-end">
          <p className="text-small text-neutral-500">Pagination</p>
          <Pagination current={2} total={8} hrefFor={() => "#"} />
        </div>
      </div>
    </SheetSection>
  );
}

const principles = [
  {
    icon: Eye,
    title: "Clarity First",
    description: "Every element should communicate clearly.",
  },
  {
    icon: LayoutGrid,
    title: "Consistency",
    description: "Use components and patterns consistently across the platform.",
  },
  {
    icon: Crosshair,
    title: "Focus & Calm",
    description: "Remove noise and help learners focus on what matters.",
  },
  {
    icon: Accessibility,
    title: "Accessible",
    description: "Design with accessibility and inclusivity in mind.",
  },
];

function PrinciplesSection() {
  return (
    <SheetSection number="14" title="Principles">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {principles.map((principle) => (
          <div key={principle.title} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-neutral-900">
              <principle.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="text-body font-medium text-neutral-900">
                {principle.title}
              </p>
              <p className="text-small text-neutral-500">
                {principle.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SheetSection>
  );
}
