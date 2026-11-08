import { Metadata } from 'next'
import { connection } from 'next/server'
import { Navbar } from '@/components/nav/navbar'
import { searchContent } from '@/sanity/lib/data'
import { SearchResultsClient } from '@/components/search/search-results-client'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    sort?: string
  }>
}

export const instant = false

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams
  const query = params.q?.trim() || ''

  if (query) {
    return {
      title: `Results for "${query}" | Vertex`,
      description: `Intelligent video timestamp and lesson search results for "${query}" across Vertex courses.`,
    }
  }

  return {
    title: 'Search Courses & Video Moments | Vertex',
    description:
      'Search across Vertex courses and jump directly to the exact second a topic is taught.',
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  await connection()
  const params = await searchParams
  const query = params.q?.trim() || ''
  const sort = params.sort || 'relevance'

  const searchResults = await searchContent(query, sort)

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar
        items={[
          { label: 'Courses', href: '/courses', active: true },
          { label: 'My Learning', href: '#' },
        ]}
      />

      <main className="flex-1">
        <SearchResultsClient
          initialData={searchResults}
          initialQuery={query}
          initialSort={sort}
        />
      </main>
    </div>
  )
}
