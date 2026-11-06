/**
 * Format total seconds into course duration string (e.g. "18h 24m", "45m", "1h 12m")
 */
export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '0m'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h`
  }
  return `${minutes}m`
}

/**
 * Format lesson seconds into concise format (e.g. "12m 30s", "5m 00s")
 */
export function formatLessonDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`
}

/**
 * Format student count for display (e.g. "2.1k", "16.8k", "500")
 */
export function formatStudentCount(count?: number): string {
  if (!count || count <= 0) return '0'
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`
  }
  return count.toLocaleString()
}

