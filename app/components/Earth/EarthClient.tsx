'use client'

import { useState } from 'react'
import EarthGlobe from './EarthGlobe'
import LocationModal from './LocationModal'
import type { Location } from './types'

interface EarthClientProps {
  locations: Location[]
  initialLocationId?: string
}

export default function EarthClient({ locations, initialLocationId }: EarthClientProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  return (
    <>
      <div className="absolute inset-0">
        <EarthGlobe
          locations={locations}
          onLocationSelect={setSelectedLocation}
          initialLocationId={initialLocationId}
        />
      </div>
      <LocationModal
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </>
  )
}
