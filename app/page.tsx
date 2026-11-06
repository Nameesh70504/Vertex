import Link from "next/link";
import { ArrowRight, Sparkle } from "lucide-react";
import { CourseCard } from "@/components/cards/course-card";
import { Navbar } from "@/components/nav/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { formatDuration } from "@/lib/format";
import { getCourses } from "@/sanity/lib/data";

export default async function Home() {
  const courses = await getCourses();
  const featuredCourses = courses.slice(0, 6);

  return (
    <div className="flex flex-1 flex-col bg-white">
      <Navbar
        items={[
          { label: "Courses", href: "/courses" },
          { label: "My Learning", href: "#" },
        ]}
      />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-[70.5rem] px-6 pb-16 pt-16 text-center sm:pt-20">
          <Badge className="rounded-md px-4 py-1.5 tracking-[0.18em]">
            Intelligent Learning
          </Badge>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-[2.375rem] font-bold leading-[1.08] tracking-tight text-neutral-900 sm:text-[3.25rem] lg:text-[3.875rem] lg:leading-[1.05]">
            Search your learning in plain English.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[1.125rem] leading-[1.75rem] text-neutral-500">
            Vertex understands what you want to learn and finds the exact lessons
            across all your courses.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/courses">
              <Button className="h-14 gap-2 px-7 text-[1rem]">
                Explore Courses
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
          <form action="/search" method="GET" className="mx-auto mt-10 max-w-3xl">
            <SearchInput
              size="lg"
              placeholder="Ask anything about your learning…"
            />
          </form>
        </section>

        <div className="mx-auto w-full max-w-[70.5rem] px-6">
          <div className="border-t border-neutral-200" />
        </div>

        <section className="mx-auto w-full max-w-[70.5rem] px-6 pb-16 pt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-heading-1 text-neutral-900">
              All Courses
            </h2>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-body font-medium text-primary-500 hover:text-primary-600"
            >
              View all courses
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => {
              const moduleCount = course.modules?.length || 0;
              const durationFormatted = formatDuration(course.totalDuration);

              return (
                <CourseCard
                  key={course._id}
                  title={course.title}
                  description={course.summary || ""}
                  logoText={course.title.charAt(0)}
                  level={course.level || "All Levels"}
                  duration={durationFormatted}
                  modules={`${moduleCount} modules`}
                  href={`/courses/${course.slug.current}`}
                  className="h-full transition-shadow hover:shadow-md"
                />
              );
            })}
          </div>
        </section>

        <div className="mx-auto flex w-full max-w-[70.5rem] items-center gap-4 px-6 pb-6">
          <span className="h-px flex-1 bg-neutral-200" aria-hidden="true" />
          <span className="inline-flex items-center gap-2 text-body text-neutral-500">
            <Sparkle className="h-5 w-5 text-primary-500" aria-hidden="true" />
            New courses and lessons added every week.
          </span>
          <span className="h-px flex-1 bg-neutral-200" aria-hidden="true" />
        </div>
      </main>

      <Skyline />
    </div>
  );
}

const skylineHeights = [
  40, 96, 64, 128, 88, 160, 120, 190, 150, 205, 170, 140, 100, 150, 90, 60,
  120, 80,
];

function Skyline() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative h-[13.75rem] w-full overflow-hidden"
    >
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-primary-200/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-1.5 px-3">
        {skylineHeights.map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-primary-300/60 to-primary-100/0"
            style={{ height: `${height / 16}rem` }}
          />
        ))}
      </div>
    </div>
  );
}
