'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import ChatInterface from '@/app/components/Chat/ChatInterface'
import type { Location } from '@/app/components/Earth/types'

const EarthClient = dynamic(() => import('@/app/components/Earth/EarthClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
        <span className="text-white/40 text-sm tracking-wider uppercase">Loading Earth</span>
      </div>
    </div>
  ),
})

interface EarthPageClientProps {
  locations: Location[]
  initialLocationId?: string
}

export default function EarthPageClient({ locations, initialLocationId }: EarthPageClientProps) {
  const [chatActive, setChatActive] = useState(false)

  return (
    <>
      <EarthClient locations={locations} initialLocationId={initialLocationId} chatActive={chatActive} />
      <ChatInterface onActiveChange={setChatActive} />
    </>
  )
}
