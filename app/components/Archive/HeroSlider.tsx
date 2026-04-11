'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Location } from '@/app/components/Earth/types'

interface HeroSliderProps {
  locations: Location[]
}

export default function HeroSlider({ locations }: HeroSliderProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((index) => (index + 1) % locations.length)
  }, [locations.length])

  const prev = () => setCurrent((index) => (index - 1 + locations.length) % locations.length)

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next, paused])

  const location = locations[current]

  return (
    <section
      className="relative min-h-[34rem] overflow-hidden sm:min-h-[38rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {locations.map((entry, index) => (
        <div
          key={entry.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: index === current ? 1 : 0, willChange: 'opacity' }}
        >
          <Image
            src={entry.thumbnail}
            alt={entry.name}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,20,0.82)_0%,rgba(5,10,20,0.3)_36%,rgba(246,243,236,0.86)_88%,#f6f3ec_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_22%,rgba(14,165,233,0.28),transparent_26%),radial-gradient(circle_at_78%_30%,rgba(250,204,21,0.2),transparent_20%)]" />

      <div className="relative mx-auto flex min-h-[34rem] max-w-7xl items-end px-4 pb-28 pt-28 sm:min-h-[38rem] sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div className="max-w-3xl text-white">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-sky-100/90">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 capitalize">
                {location.category}
              </span>
              <span className="rounded-full border border-white/12 bg-black/20 px-3 py-1 text-white/60">
                Archive spotlight
              </span>
            </div>

            <h2 className="max-w-2xl text-4xl font-semibold leading-[1.05] sm:text-[4.2rem]">
              {location.name}
            </h2>
            <p className="mt-3 text-sm uppercase tracking-[0.18em] text-white/60">
              {location.city}, {location.state}
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/74 sm:text-base">
              {location.description}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/earth?location=${location.id}`}
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-900 transition-transform hover:-translate-y-0.5"
              >
                Enter from globe
              </Link>
              <a
                href={location.affiliate.hotel}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/16"
              >
                Stay nearby
              </a>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/12 bg-black/18 p-4 text-white/88 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/46">Spotlight note</p>
            <p className="mt-3 text-sm leading-7 text-white/72">
              Use the archive when the globe gives you wonder and the next step needs clarity.
            </p>

            <div className="mt-6 flex items-center gap-2">
              {locations.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  aria-label={`Show destination ${index + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    index === current ? 'w-8 bg-white' : 'w-2 bg-white/35 hover:bg-white/55'
                  }`}
                />
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8 transition-colors hover:bg-white/14"
                aria-label="Previous destination"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8 transition-colors hover:bg-white/14"
                aria-label="Next destination"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
