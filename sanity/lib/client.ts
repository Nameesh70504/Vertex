import { createClient, type QueryParams } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

// Base client safe for usage without exposing secrets
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
})

/**
 * Server-only data fetcher that queries Sanity using the server read token
 * for private dataset access. Never expose tokens to client components.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  revalidate = 60,
  tags = [],
}: {
  query: string
  params?: QueryParams
  revalidate?: number | false
  tags?: string[]
}): Promise<T> {
  const token = process.env.SANITY_API_READ_TOKEN

  return client.fetch<T>(query, params, {
    ...(token ? { token, useCdn: false } : {}),
    next: {
      ...(typeof revalidate === 'number' ? { revalidate } : {}),
      ...(tags.length > 0 ? { tags } : {}),
    },
  })
}

/**
 * Server-only client for performing mutations (progress tracking, etc.).
 * Uses SANITY_API_WRITE_TOKEN, falling back to SANITY_API_READ_TOKEN if it has write permissions.
 */
export function getSanityWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN
  if (!token) {
    throw new Error('Sanity write token is missing in environment variables.')
  }
  return client.withConfig({
    token,
    useCdn: false,
  })
}

