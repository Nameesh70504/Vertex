'use client'

interface VideoEmbedProps {
  url: string
  title?: string
  startSeconds?: number
}

function getEmbedUrl(url: string, startSeconds?: number): string | null {
  try {
    // 1. YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = ''
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0].split('&')[0]
      } else if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0]
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1].split('?')[0]
      }

      if (videoId) {
        const startParam = startSeconds && startSeconds > 0 ? `&start=${Math.floor(startSeconds)}` : ''
        return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1${startParam}`
      }
    }

    // 2. Vimeo
    if (url.includes('vimeo.com')) {
      const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/)
      const vimeoId = match ? match[3] : ''
      if (vimeoId) {
        const startParam = startSeconds && startSeconds > 0 ? `#t=${Math.floor(startSeconds)}s` : ''
        return `https://player.vimeo.com/video/${vimeoId}${startParam}`
      }
    }

    // 3. Bunny CDN
    if (url.includes('bunnycdn.com') || url.includes('mediadelivery.net')) {
      const startParam = startSeconds && startSeconds > 0 ? `?t=${Math.floor(startSeconds)}` : ''
      return `${url}${startParam}`
    }

    return null
  } catch {
    return null
  }
}

export function VideoEmbed({ url, title, startSeconds }: VideoEmbedProps) {
  const embedUrl = getEmbedUrl(url, startSeconds)

  if (!embedUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral-900 flex items-center justify-center text-white">
        <p className="text-body text-neutral-400">Video source unavailable</p>
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
      <iframe
        src={embedUrl}
        title={title || 'Lesson Video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  )
}

