import fs from 'fs'
import path from 'path'

interface VideoMetadata {
  id: string
  title: string
  channel: string
  duration: number
  query: string
}

interface LessonDoc {
  _id: string
  _type: string
  title: string
  slug: { current: string }
  videoUrl: string
  duration: number
  keyPoints?: string[]
  notes?: Array<{
    _type: string
    style?: string
    children?: Array<{ text?: string }>
  }>
}

interface Chapter {
  _key: string
  startSeconds: number
  label: string
}

interface Chunk {
  _key: string
  startSeconds: number
  text: string
}

interface VideoDocument {
  _id: string
  _type: 'video'
  videoId: string
  url: string
  title: string
  provider: 'youtube'
  duration: number
  chapters: Chapter[]
  chunks: Chunk[]
}

function sanitizeId(provider: string, id: string): string {
  // Strip characters rejected by Sanity document IDs
  const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '_')
  return `video.${provider}_${cleanId}`
}

function extractNotesText(notes?: LessonDoc['notes']): string[] {
  if (!notes || !Array.isArray(notes)) return []
  const texts: string[] = []
  for (const block of notes) {
    if (block.children) {
      const line = block.children
        .map((c) => c.text || '')
        .join(' ')
        .trim()
      if (line) texts.push(line)
    }
  }
  return texts
}

export function generateVideoDocuments(): VideoDocument[] {
  const rootDir = process.cwd()
  const videosJsonPath = path.join(rootDir, 'script', 'seed', 'videos.json')
  const seedNdjsonPath = path.join(rootDir, 'script', 'seed', 'seed.ndjson')

  const videosData: Record<string, VideoMetadata> = JSON.parse(
    fs.readFileSync(videosJsonPath, 'utf8')
  )

  const lessonLines = fs
    .readFileSync(seedNdjsonPath, 'utf8')
    .split('\n')
    .filter((l) => l.trim().length > 0)

  const lessonsBySlug = new Map<string, LessonDoc>()
  for (const line of lessonLines) {
    try {
      const doc = JSON.parse(line)
      if (doc._type === 'lesson' && doc.slug?.current) {
        lessonsBySlug.set(doc.slug.current, doc)
      }
    } catch {
      // Skip invalid JSON lines
    }
  }

  const videoDocs: VideoDocument[] = []
  const processedVideoIds = new Set<string>()

  for (const [slug, videoMeta] of Object.entries(videosData)) {
    if (processedVideoIds.has(videoMeta.id)) continue
    processedVideoIds.add(videoMeta.id)

    const lesson = lessonsBySlug.get(slug)
    const duration = Math.max(videoMeta.duration || lesson?.duration || 300, 60)
    const keyPoints = lesson?.keyPoints || [
      'Core architecture and concepts',
      'Hands-on implementation details',
      'Production debugging and optimization',
    ]
    const notesText = extractNotesText(lesson?.notes)

    // 1. Table of Contents / Chapters
    const chapters: Chapter[] = []
    chapters.push({
      _key: `${videoMeta.id}-ch-0`,
      startSeconds: 0,
      label: 'Introduction & Overview',
    })

    const interval = Math.floor(duration / (keyPoints.length + 1))
    keyPoints.forEach((point, idx) => {
      chapters.push({
        _key: `${videoMeta.id}-ch-${idx + 1}`,
        startSeconds: Math.min((idx + 1) * interval, duration - 15),
        label: point,
      })
    })

    // 2. Transcript Chunks (15-30s windows)
    const chunks: Chunk[] = []
    const chunkWindow = 25
    const totalChunks = Math.max(Math.floor(duration / chunkWindow), 4)

    const narrativeSeeds = [
      `In this video we explore ${videoMeta.title}.`,
      `Let's begin by looking at why this pattern matters in modern software engineering.`,
      ...notesText,
      ...keyPoints.map((k) => `Here we focus directly on: ${k}.`),
      `Notice how the configuration connects the components together cleanly.`,
      `A common pitfall at this stage is unexpected state changes or unhandled errors.`,
      `Let's test this in production conditions to verify performance and correctness.`,
      `To wrap up, remember to check your assumptions and review the lesson resources.`,
    ]

    for (let c = 0; c < totalChunks; c++) {
      const startSec = c * chunkWindow
      if (startSec >= duration) break
      const text = narrativeSeeds[c % narrativeSeeds.length]

      chunks.push({
        _key: `${videoMeta.id}-chunk-${c}`,
        startSeconds: startSec,
        text,
      })
    }

    const docId = sanitizeId('youtube', videoMeta.id)

    videoDocs.push({
      _id: docId,
      _type: 'video',
      videoId: videoMeta.id,
      url: `https://www.youtube.com/watch?v=${videoMeta.id}`,
      title: videoMeta.title || lesson?.title || 'Lesson Video',
      provider: 'youtube',
      duration,
      chapters,
      chunks,
    })
  }

  return videoDocs
}

// When executed directly via node/tsx:
if (process.argv[1]?.includes('ingest-videos')) {
  console.log('Ingesting YouTube videos and building video intelligence documents...')
  const videoDocs = generateVideoDocuments()
  console.log(`Generated ${videoDocs.length} video documents.`)

  const outputPath = path.join(process.cwd(), 'script', 'seed', 'videos.ndjson')
  const ndjsonContent = videoDocs.map((doc) => JSON.stringify(doc)).join('\n')
  fs.writeFileSync(outputPath, ndjsonContent, 'utf8')
  console.log(`Successfully wrote ${videoDocs.length} records to ${outputPath}`)
}

