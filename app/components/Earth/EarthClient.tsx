'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import EarthGlobe from './EarthGlobe'
import LocationModal from './LocationModal'
import type { Location } from './types'

interface EarthClientProps {
  locations: Location[]
  initialLocationId?: string
  chatActive?: boolean
}

export default function EarthClient({ locations, initialLocationId, chatActive = false }: EarthClientProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-[-10vw] w-[120vw]"
          animate={{
            x: chatActive ? '-10vw' : '0vw',
          }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        >
          <EarthGlobe
            locations={locations}
            onLocationSelect={setSelectedLocation}
            initialLocationId={initialLocationId}
          />
        </motion.div>
      </div>
      <LocationModal
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </>
  )
}
