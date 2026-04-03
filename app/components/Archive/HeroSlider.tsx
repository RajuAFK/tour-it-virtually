'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { Location } from '@/app/components/Earth/types'

interface HeroSliderProps {
  locations: Location[]
}

export default function HeroSlider({ locations }: HeroSliderProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % locations.length)
  }, [locations.length])

  const prev = () => setCurrent((i) => (i - 1 + locations.length) % locations.length)

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 4500)
    return () => clearInterval(id)
  }, [paused, next])

  const loc = locations[current]

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 360 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Images */}
      {locations.map((l, i) => (
        <div
          key={l.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={l.thumbnail}
            alt={l.name}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-8 left-10 right-16">
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3 capitalize"
          style={{ background: 'rgba(15,20,40,0.7)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}
        >
          {loc.category}
        </div>
        <h2 className="text-3xl font-bold text-slate-900 leading-tight">{loc.name}</h2>
        <p className="text-slate-600 text-sm mt-1">
          {loc.city}, {loc.state}
        </p>
      </div>

      {/* Arrow controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-all"
      >
        <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-all"
      >
        <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {locations.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? 'w-6 bg-sky-500' : 'w-1.5 bg-slate-400/60'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
