import React from 'react'

interface CourseIconProps {
  title?: string
  slug?: string
  className?: string
}

export function CourseIcon({ title = '', slug = '', className = '' }: CourseIconProps) {
  const s = slug.toLowerCase()
  const t = title.toLowerCase()

  if (s.includes('next') || t.includes('next')) {
    return (
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-black text-[10px] font-black text-white ${className}`}
        title="Next.js"
      >
        N
      </span>
    )
  }

  if (s.includes('react') || t.includes('react')) {
    return (
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-sky-500 text-[11px] font-bold text-white ${className}`}
        title="React"
      >
        ⚛
      </span>
    )
  }

  if (s.includes('node') || t.includes('node')) {
    return (
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-[9px] font-bold text-white ${className}`}
        title="Node.js"
      >
        JS
      </span>
    )
  }

  if (s.includes('javascript') || t.includes('javascript')) {
    return (
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-400 text-[9px] font-bold text-black ${className}`}
        title="JavaScript"
      >
        JS
      </span>
    )
  }

  if (s.includes('postgres') || t.includes('postgres')) {
    return (
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-600 text-[9px] font-bold text-white ${className}`}
        title="PostgreSQL"
      >
        PG
      </span>
    )
  }

  if (s.includes('docker') || s.includes('devops') || t.includes('docker')) {
    return (
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-600 text-[10px] font-bold text-white ${className}`}
        title="DevOps"
      >
        🐳
      </span>
    )
  }

  if (s.includes('python') || t.includes('python')) {
    return (
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-500 text-[9px] font-bold text-white ${className}`}
        title="Python"
      >
        PY
      </span>
    )
  }

  if (s.includes('typescript') || t.includes('typescript')) {
    return (
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-500 text-[9px] font-bold text-white ${className}`}
        title="TypeScript"
      >
        TS
      </span>
    )
  }

  if (s.includes('ai') || s.includes('rag') || s.includes('llm') || t.includes('ai')) {
    return (
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-purple-600 text-[9px] font-bold text-white ${className}`}
        title="AI"
      >
        AI
      </span>
    )
  }

  // Fallback initial
  const initial = (title.charAt(0) || 'V').toUpperCase()
  return (
    <span
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-neutral-800 text-[10px] font-bold text-white ${className}`}
    >
      {initial}
    </span>
  )
}
