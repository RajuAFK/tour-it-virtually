'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from '@/app/components/Navbar'
import HeroSlider from '@/app/components/Archive/HeroSlider'
import CategoryFilter from '@/app/components/Archive/CategoryFilter'
import LocationCard from '@/app/components/Archive/LocationCard'
import ChatInterface from '@/app/components/Chat/ChatInterface'
import type { Location } from '@/app/components/Earth/types'

interface ArchiveClientProps {
  locations: Location[]
}

export default function ArchiveClient({ locations }: ArchiveClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    locations.forEach((location) => {
      counts[location.category] = (counts[location.category] ?? 0) + 1
    })
    return counts
  }, [locations])

  const filtered = useMemo(() => {
    return locations.filter((location) => {
      const matchesCategory = selectedCategory === 'all' || location.category === selectedCategory
      const matchesSearch =
        !search ||
        location.name.toLowerCase().includes(search.toLowerCase()) ||
        location.city.toLowerCase().includes(search.toLowerCase()) ||
        location.state.toLowerCase().includes(search.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [locations, search, selectedCategory])

  const stats = useMemo(
    () => [
      { label: 'Destinations', value: locations.length },
      { label: 'Categories', value: Object.keys(categoryCounts).length },
      { label: 'Visible now', value: filtered.length },
    ],
    [categoryCounts, filtered.length, locations.length],
  )

  return (
    <div className="archive-page relative min-h-screen overflow-hidden bg-[#f6f3ec] text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(250,204,21,0.16),transparent_24%),linear-gradient(180deg,#f7f4ee_0%,#f4efe6_50%,#f6f3ec_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.36), transparent 85%)',
        }}
      />

      <div className="relative">
        <div
          className="absolute inset-0 z-20"
          style={{ background: 'linear-gradient(to bottom, rgba(8,15,28,0.82) 0%, rgba(8,15,28,0.32) 34%, transparent 100%)' }}
        />
        <div className="relative z-30">
          <Navbar />
        </div>
        <HeroSlider locations={locations} />
      </div>

      <main className="relative mx-auto -mt-14 max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <section className="relative z-10 rounded-[2rem] border border-white/65 bg-white/72 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-7">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-sky-700/80">
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1">Archive Flow</span>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                  From orbit to shortlist
                </span>
              </div>

              <div className="max-w-3xl space-y-3">
                <h1 className="text-3xl font-semibold leading-tight text-slate-950 sm:text-[2.75rem]">
                  Narrow the journey before you return to the globe.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  The archive is the planning layer of the experience. Scan what is live, filter by travel mood,
                  and jump back into the earth view with a clearer sense of where the next tour should begin.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/90 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                  >
                    <div className="text-2xl font-semibold text-slate-950">{stat.value}</div>
                    <div className="mt-1 text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0.01))] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Suggested path</p>
              <div className="mt-3 space-y-3">
                <JourneyStep number="01" title="Filter the mood" description="Use category chips to move from broad curiosity to a tighter shortlist." />
                <JourneyStep number="02" title="Read the terrain" description="Cards surface place, category, and a fast route back to globe context." />
                <JourneyStep number="03" title="Launch with intent" description="Re-enter `/earth` already anchored to the destination you chose here." />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Find your route</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Browse active destinations</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''} visible in the current view
              </p>
            </div>

            <div className="relative w-full max-w-sm">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by destination, city, or state"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white/90 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100/80"
              />
            </div>
          </div>

          <div className="mt-6">
            <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} counts={categoryCounts} />
          </div>
        </section>

        <section className="mt-8">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div key="grid" layout className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((location, index) => (
                  <motion.div
                    key={location.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.28, delay: index * 0.035 }}
                  >
                    <LocationCard location={location} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 px-6 py-20 text-center shadow-[0_16px_50px_rgba(15,23,42,0.05)]"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-500">
                  ?
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-800">No destinations match this route yet</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Reset the filters or widen the search to return to the full active collection.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSearch('')
                  }}
                  className="mt-5 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                >
                  Clear filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="border-t border-slate-200/70 bg-white/50 py-8 text-center">
        <p className="text-sm text-slate-500">© 2025 TourItVirtually · Immersive 360° virtual travel</p>
      </footer>

      <ChatInterface />
    </div>
  )
}

function JourneyStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          {number}
        </span>
        <div>
          <p className="text-sm font-medium text-slate-900">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  )
}
