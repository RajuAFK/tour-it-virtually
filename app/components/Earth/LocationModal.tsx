'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Location } from './types'
import Image from 'next/image'

const CATEGORY_COLORS: Record<string, string> = {
  adventure: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  unexplored: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  pilgrimages: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'places of worship': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  historical: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'world heritage': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'get aways': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
}

interface LocationModalProps {
  location: Location | null
  onClose: () => void
}

export default function LocationModal({ location, onClose }: LocationModalProps) {
  const [tourLoading, setTourLoading] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  // Close on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (tourOpen) {
          setTourOpen(false)
        } else {
          onClose()
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, tourOpen])

  // Reset iframe state when location changes
  useEffect(() => {
    setTourOpen(false)
    setIframeLoaded(false)
    setTourLoading(false)
  }, [location?.id])

  const handleViewTour = () => {
    setTourLoading(true)
    setTourOpen(true)
  }

  const categoryClass = location
    ? CATEGORY_COLORS[location.category] ?? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
    : ''

  return (
    <AnimatePresence>
      {location && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          >
            <div
              className="pointer-events-auto w-full max-w-md relative overflow-hidden rounded-2xl"
              style={{
                background: 'rgba(15, 20, 40, 0.85)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Thumbnail */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={location.thumbnail}
                  alt={location.name}
                  fill
                  className="object-cover"
                  sizes="448px"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    img.style.display = 'none'
                  }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1428]/90 via-[#0f1428]/20 to-transparent" />

                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <span className={`pill border text-xs capitalize ${categoryClass}`}>
                    {location.category}
                  </span>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Location name on image */}
                <div className="absolute bottom-3 left-4 right-4">
                  <h2 className="text-white text-xl font-semibold leading-tight">{location.name}</h2>
                  <p className="text-white/60 text-sm mt-0.5">
                    {location.city}, {location.state}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <p className="text-white/70 text-sm leading-relaxed">{location.description}</p>

                {/* Virtual Tour — Lazy iframe */}
                {tourOpen && (
                  <div className="relative rounded-xl overflow-hidden" style={{ height: 220 }}>
                    {tourLoading && !iframeLoaded && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-3 z-10">
                        <div className="w-8 h-8 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
                        <span className="text-white/50 text-xs">Loading immersive tour...</span>
                      </div>
                    )}
                    <iframe
                      src={location.tourUrl}
                      className="w-full h-full border-0"
                      title={`Virtual tour of ${location.name}`}
                      allow="fullscreen; gyroscope; accelerometer"
                      onLoad={() => {
                        setIframeLoaded(true)
                        setTourLoading(false)
                      }}
                    />
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  {!tourOpen ? (
                    <button
                      onClick={handleViewTour}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                        boxShadow: '0 4px 20px rgba(14,165,233,0.35)',
                      }}
                    >
                      🌐 View Virtual Tour
                    </button>
                  ) : (
                    <button
                      onClick={() => setTourOpen(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/15 text-white/80 transition-all"
                    >
                      Close Tour
                    </button>
                  )}

                  <a
                    href={location.affiliate.hotel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-center transition-all border border-amber-400/30 text-amber-300 hover:bg-amber-400/10"
                  >
                    🏨 Book Now
                  </a>
                </div>

                {/* Coordinates */}
                <div className="flex items-center gap-1.5 text-xs text-white/30">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {location.coordinates.lat.toFixed(4)}°N, {location.coordinates.lng.toFixed(4)}°E
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
