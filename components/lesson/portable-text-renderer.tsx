import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from 'sanity'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="my-3 text-body-large text-neutral-700 leading-relaxed">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 mb-3 font-display text-heading-2 text-neutral-900">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 mb-2 font-display text-heading-3 text-neutral-900">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-4 mb-2 font-semibold text-neutral-900 text-body-large">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 border-l-4 border-primary-500 bg-primary-100/20 py-2 pl-4 pr-3 italic text-neutral-700 rounded-r-md">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-3 list-disc space-y-1.5 pl-6 text-body-large text-neutral-700">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-3 list-decimal space-y-1.5 pl-6 text-body-large text-neutral-700">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-neutral-900">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-small text-neutral-900 border border-neutral-200">
        {children}
      </code>
    ),
    link: ({ value, children }) => {
      const target = (value?.href || '').startsWith('http') ? '_blank' : undefined
      return (
        <a
          href={value?.href}
          target={target}
          rel={target ? 'noopener noreferrer' : undefined}
          className="font-medium text-primary-600 underline underline-offset-2 hover:text-primary-700"
        >
          {children}
        </a>
      )
    },
  },
}

export function PortableTextRenderer({ value }: { value?: PortableTextBlock[] }) {
  if (!value || value.length === 0) return null
  return (
    <div className="prose prose-neutral max-w-none">
      <PortableText value={value} components={components} />
    </div>
  )
}

