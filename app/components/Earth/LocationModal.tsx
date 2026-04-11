'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { Location } from './types'

const CATEGORY_COLORS: Record<string, string> = {
  adventure: 'bg-emerald-500/18 text-emerald-200 border-emerald-400/24',
  unexplored: 'bg-fuchsia-500/18 text-fuchsia-200 border-fuchsia-400/24',
  pilgrimages: 'bg-amber-500/18 text-amber-100 border-amber-400/24',
  'places of worship': 'bg-orange-500/18 text-orange-100 border-orange-400/24',
  historical: 'bg-blue-500/18 text-blue-100 border-blue-400/24',
  'world heritage': 'bg-rose-500/18 text-rose-100 border-rose-400/24',
  'get aways': 'bg-teal-500/18 text-teal-100 border-teal-400/24',
}

interface LocationModalProps {
  location: Location | null
  onClose: () => void
}

export default function LocationModal({ location, onClose }: LocationModalProps) {
  const [tourLoading, setTourLoading] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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

  useEffect(() => {
    setTourOpen(false)
    setIframeLoaded(false)
    setTourLoading(false)
  }, [location?.id])

  const categoryClass = location
    ? CATEGORY_COLORS[location.category] ?? 'bg-sky-500/18 text-sky-100 border-sky-400/24'
    : ''

  const handleViewTour = () => {
    setTourLoading(true)
    setTourOpen(true)
  }

  return (
    <AnimatePresence>
      {location && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-[rgba(3,8,18,0.7)] backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            key="modal"
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          >
            <div
              className="pointer-events-auto relative flex max-h-[min(92vh,56rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,28,0.97),rgba(10,16,28,0.92))] shadow-[0_30px_100px_rgba(0,0,0,0.45)] lg:grid lg:grid-cols-[1.05fr_0.95fr]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative min-h-[20rem] overflow-hidden lg:min-h-full">
                <Image
                  src={location.thumbnail}
                  alt={location.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,16,28,0.16)_0%,rgba(8,16,28,0.24)_34%,rgba(8,16,28,0.92)_100%)] lg:bg-[linear-gradient(90deg,rgba(8,16,28,0.18)_0%,rgba(8,16,28,0.18)_34%,rgba(8,16,28,0.74)_100%)]" />

                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  <span className={`pill border text-xs capitalize ${categoryClass}`}>{location.category}</span>
                  <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-white/55">
                    Destination briefing
                  </span>
                </div>

                <div className="absolute inset-x-5 bottom-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/52">
                    {location.city}, {location.state}, {location.country}
                  </p>
                  <h2 className="mt-2 max-w-xl text-3xl font-semibold leading-tight text-white sm:text-[2.4rem]">
                    {location.name}
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">{location.description}</p>
                </div>
              </div>

              <div className="flex min-h-0 flex-col bg-[linear-gradient(180deg,rgba(10,16,28,0.84),rgba(10,16,28,0.98))]">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/24 text-white/70 transition-colors hover:bg-black/38 hover:text-white"
                  aria-label="Close destination details"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex-1 overflow-y-auto px-5 pb-5 pt-16 sm:px-6">
                  <div className="grid gap-4">
                    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/42">Way forward</p>
                      <div className="mt-3 grid gap-3">
                        <ModalStep title="Read the place" description="Start with the location story, terrain, and travel context before launching the experience." />
                        <ModalStep title="Enter the 360° tour" description="Open the immersive view when you are ready to step into the destination itself." />
                        <ModalStep title="Plan the real-world follow-up" description="Use the stay link once the virtual visit gives you enough confidence to continue." />
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/42">Coordinates</p>
                      <p className="mt-2 text-sm text-white/68">
                        {location.coordinates.lat.toFixed(4)}°N, {location.coordinates.lng.toFixed(4)}°E
                      </p>
                    </div>

                    {tourOpen ? (
                      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/8 bg-black/20" style={{ height: 300 }}>
                        {tourLoading && !iframeLoaded && (
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/58">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
                            <span className="text-xs uppercase tracking-[0.18em] text-white/50">Loading immersive tour</span>
                          </div>
                        )}
                        <iframe
                          src={location.tourUrl}
                          className="h-full w-full border-0"
                          title={`Virtual tour of ${location.name}`}
                          allow="fullscreen; gyroscope; accelerometer"
                          onLoad={() => {
                            setIframeLoaded(true)
                            setTourLoading(false)
                          }}
                        />
                      </div>
                    ) : (
                      <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.035] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/42">Immersive preview</p>
                        <p className="mt-3 text-sm leading-7 text-white/68">
                          Open the 360° tour when you want to move from briefing into the full spatial experience.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 border-t border-white/8 bg-black/18 px-5 py-4 sm:px-6">
                  {!tourOpen ? (
                    <button
                      onClick={handleViewTour}
                      className="rounded-2xl bg-[linear-gradient(135deg,#0ea5e9,#2563eb)] px-5 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition-transform hover:-translate-y-0.5"
                    >
                      Open 360° virtual tour
                    </button>
                  ) : (
                    <button
                      onClick={() => setTourOpen(false)}
                      className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white"
                    >
                      Close immersive tour
                    </button>
                  )}

                  <a
                    href={location.affiliate.hotel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-amber-300/24 bg-amber-400/8 px-5 py-3 text-center text-sm font-medium text-amber-100 transition-colors hover:bg-amber-400/12"
                  >
                    Plan stay nearby
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ModalStep({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-white/58">{description}</p>
    </div>
  )
}
