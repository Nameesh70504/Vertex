import { NextRequest, NextResponse } from 'next/server'
import { searchContent } from '@/sanity/lib/data'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const sort = searchParams.get('sort') || 'relevance'

    if (!query.trim()) {
      return NextResponse.json({
        query: '',
        totalCount: 0,
        courseCount: 0,
        results: [],
      })
    }

    const searchResults = await searchContent(query, sort)
    return NextResponse.json(searchResults)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Failed to execute search query' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const query = body.query || body.q || ''
    const sort = body.sort || 'relevance'

    if (!query.trim()) {
      return NextResponse.json({
        query: '',
        totalCount: 0,
        courseCount: 0,
        results: [],
      })
    }

    const searchResults = await searchContent(query, sort)
    return NextResponse.json(searchResults)
  } catch (error) {
    console.error('Search API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to execute search query' },
      { status: 500 }
    )
  }
}
