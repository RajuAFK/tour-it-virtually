'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/app/components/Navbar'
import HeroSlider from '@/app/components/Archive/HeroSlider'
import CategoryFilter from '@/app/components/Archive/CategoryFilter'
import LocationCard from '@/app/components/Archive/LocationCard'
import type { Location } from '@/app/components/Earth/types'
import ChatInterface from '@/app/components/Chat/ChatInterface'

interface ArchiveClientProps {
  locations: Location[]
}

export default function ArchiveClient({ locations }: ArchiveClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    locations.forEach((l) => {
      counts[l.category] = (counts[l.category] ?? 0) + 1
    })
    return counts
  }, [locations])

  const filtered = useMemo(() => {
    return locations.filter((l) => {
      const matchCat = selectedCategory === 'all' || l.category === selectedCategory
      const matchSearch =
        !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.city.toLowerCase().includes(search.toLowerCase()) ||
        l.state.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [locations, selectedCategory, search])

  return (
    <div className="archive-page min-h-screen">
      {/* Navbar — dark overlay on white page */}
      <div className="relative">
        <div
          className="absolute inset-0 z-20"
          style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.85) 0%, transparent 100%)' }}
        />
        <div className="relative z-30">
          <Navbar />
        </div>
        <HeroSlider locations={locations} />
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Explore Destinations</h1>
            <p className="text-slate-500 text-sm mt-1">
              {filtered.length} virtual tour{filtered.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations..."
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 w-52 transition-all"
            />
          </div>
        </div>

        {/* Subtle grid background */}
        <div
          className="fixed inset-0 pointer-events-none -z-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Category filters */}
        <div className="mb-8">
          <CategoryFilter
            selected={selectedCategory}
            onChange={setSelectedCategory}
            counts={categoryCounts}
          />
        </div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div
              key="grid"
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filtered.map((loc, i) => (
                <motion.div
                  key={loc.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <LocationCard location={loc} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <span className="text-5xl mb-4">🔍</span>
              <h3 className="text-slate-600 font-medium">No destinations found</h3>
              <p className="text-slate-400 text-sm mt-1">Try a different category or search term</p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearch('') }}
                className="mt-4 text-sky-600 text-sm font-medium hover:underline"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-16 py-8 text-center">
        <p className="text-slate-400 text-sm">
          © 2025 TourItVirtually · Immersive 360° virtual travel
        </p>
      </footer>

      <ChatInterface />
    </div>
  )
}
