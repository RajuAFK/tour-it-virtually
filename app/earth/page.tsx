import Navbar from '@/app/components/Navbar'
import ChatInterface from '@/app/components/Chat/ChatInterface'
import EarthPageClient from './EarthPageClient'
import locationsData from '@/data/locations.json'
import type { Location } from '@/app/components/Earth/types'

export default async function EarthPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>
}) {
  const params = await searchParams
  const locations = locationsData as Location[]

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0f]">
      <Navbar />
      <EarthPageClient locations={locations} initialLocationId={params.location} />
      <ChatInterface />
    </div>
  )
}
