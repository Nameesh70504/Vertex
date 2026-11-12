'use client'

interface VideoEmbedProps {
  url?: string
  title?: string
  startSeconds?: number
}

function getEmbedUrl(url: string, startSeconds?: number): string | null {
  try {
    const cleanUrl = url.trim()

    // 1. YouTube
    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
      let videoId = ''
      if (cleanUrl.includes('youtu.be/')) {
        videoId = cleanUrl.split('youtu.be/')[1].split('?')[0].split('&')[0]
      } else if (cleanUrl.includes('v=')) {
        videoId = cleanUrl.split('v=')[1].split('&')[0]
      } else if (cleanUrl.includes('embed/')) {
        videoId = cleanUrl.split('embed/')[1].split('?')[0]
      }

      if (videoId) {
        const startParam =
          startSeconds && startSeconds > 0 ? `&start=${Math.floor(startSeconds)}` : ''
        return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1${startParam}`
      }
    }

    // 2. Vimeo
    if (cleanUrl.includes('vimeo.com')) {
      const match = cleanUrl.match(
        /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/
      )
      const vimeoId = match ? match[3] : ''
      if (vimeoId) {
        const startParam =
          startSeconds && startSeconds > 0 ? `#t=${Math.floor(startSeconds)}s` : ''
        return `https://player.vimeo.com/video/${vimeoId}${startParam}`
      }
    }

    // 3. Bunny CDN
    if (cleanUrl.includes('bunnycdn.com') || cleanUrl.includes('mediadelivery.net')) {
      const startParam =
        startSeconds && startSeconds > 0 ? `?t=${Math.floor(startSeconds)}` : ''
      return `${cleanUrl}${startParam}`
    }

    return null
  } catch {
    return null
  }
}

export function VideoEmbed({ url, title, startSeconds }: VideoEmbedProps) {
  const fallbackUrl = 'https://www.youtube.com/watch?v=WKfPctdIDek'
  const embedUrl = getEmbedUrl(url || fallbackUrl, startSeconds)

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-md">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={title || 'Lesson Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-neutral-400 text-sm">
          Video source unavailable
        </div>
      )}
    </div>
  )
}
