import {
  Brain,
  Cloud,
  Cpu,
  Database,
  Gauge,
  Layers,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react'
import type { LearningOutcome } from '@/sanity/types'

const iconMap: Record<string, React.ElementType> = {
  layers: Layers,
  database: Database,
  gauge: Gauge,
  performance: Gauge,
  cloud: Cloud,
  deployment: Cloud,
  brain: Brain,
  ai: Brain,
  zap: Zap,
  shield: Shield,
  security: Shield,
  sparkles: Sparkles,
  terminal: Terminal,
  cpu: Cpu,
}

export function WhatYoullLearn({
  outcomes,
}: {
  outcomes?: LearningOutcome[]
}) {
  if (!outcomes || outcomes.length === 0) return null

  return (
    <section className="mt-14">
      <h2 className="font-display text-heading-1 text-neutral-900">
        What you&apos;ll learn
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {outcomes.map((outcome, idx) => {
          const iconKey = outcome.icon?.toLowerCase() || 'layers'
          const IconComponent = iconMap[iconKey] || Layers

          return (
            <div
              key={outcome._key || idx}
              className="flex items-start gap-4 rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-100/60 text-primary-500">
                <IconComponent className="h-6 w-6 stroke-[1.5]" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 text-body-large">
                  {outcome.title}
                </h3>
                <p className="mt-1.5 text-body text-neutral-500 leading-relaxed">
                  {outcome.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

