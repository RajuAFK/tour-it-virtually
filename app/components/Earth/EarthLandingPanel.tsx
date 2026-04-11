'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Location } from './types'

interface EarthLandingPanelProps {
  locations: Location[]
  chatActive: boolean
}

const STEP_COPY = [
  {
    title: 'Spin the globe',
    description: 'Drag to explore and start with the India focus already waiting for you.',
  },
  {
    title: 'Enter country view',
    description: 'Click India to reveal the destination markers inside the current rollout area.',
  },
  {
    title: 'Open a tour',
    description: 'Pick a location, launch the virtual tour, or use chat to plan the next stop.',
  },
]

export default function EarthLandingPanel({ locations, chatActive }: EarthLandingPanelProps) {
  const categoryCount = new Set(locations.map((location) => location.category)).size
  const featuredLocations = locations.slice(0, 3)

  return (
    <motion.aside
      animate={{
        opacity: chatActive ? 0.22 : 1,
        x: chatActive ? -32 : 0,
        y: chatActive ? -6 : 0,
        scale: chatActive ? 0.96 : 1,
      }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="pointer-events-none absolute inset-x-0 top-20 z-20 px-4 sm:px-6"
    >
      <div className="mx-auto flex max-w-7xl justify-start">
        <div className="pointer-events-auto w-full max-w-[min(32rem,100%)] rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(9,16,32,0.86),rgba(9,16,32,0.54))] p-5 text-white shadow-[0_28px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-sky-200/78">
            <span className="rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1">Way Forward</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/52">
              India rollout
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="max-w-xl text-3xl font-semibold leading-tight text-white sm:text-[2.5rem]">
              Start with the globe, then descend into places that feel hidden even on the map.
            </h1>
            <p className="max-w-lg text-sm leading-6 text-white/68 sm:text-[0.95rem]">
              TourItVirtually is currently structured as an India-first exploration flow: orbit the world,
              enter the country view, reveal live markers, and step straight into immersive tours.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatPill value={locations.length} label="Live destinations" />
            <StatPill value={categoryCount} label="Travel moods" />
            <StatPill value="360°" label="Immersive entry" />
          </div>

          <div className="mt-6 grid gap-3">
            {STEP_COPY.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/8 bg-white/[0.045] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <div className="mb-1 flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-400/16 text-xs font-semibold text-sky-100">
                    0{index + 1}
                  </span>
                  <h2 className="text-sm font-medium text-white">{step.title}</h2>
                </div>
                <p className="pl-10 text-sm leading-6 text-white/60">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-white/8 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/44">Currently featured</p>
                <p className="mt-1 text-sm text-white/72">Three strong entry points into the current collection.</p>
              </div>
              <Link
                href="/archive"
                className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/72 transition-colors hover:bg-white/[0.1] hover:text-white"
              >
                Browse archive
              </Link>
            </div>

            <div className="grid gap-2.5">
              {featuredLocations.map((location) => (
                <Link
                  key={location.id}
                  href={`/earth?location=${location.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.045] px-4 py-3 transition-all hover:border-sky-300/20 hover:bg-sky-400/[0.08]"
                >
                  <div>
                    <p className="text-sm font-medium text-white transition-colors group-hover:text-sky-100">
                      {location.name}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/42">
                      {location.city}, {location.state}
                    </p>
                  </div>
                  <span className="text-sm text-white/34 transition-transform group-hover:translate-x-1 group-hover:text-white/72">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

function StatPill({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.045] px-4 py-3">
      <div className="text-lg font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.12em] text-white/42">{label}</div>
    </div>
  )
}
