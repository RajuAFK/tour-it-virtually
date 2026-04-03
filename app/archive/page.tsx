import locationsData from '@/data/locations.json'
import type { Location } from '@/app/components/Earth/types'
import ArchiveClient from './ArchiveClient'

export default function ArchivePage() {
  const locations = locationsData as Location[]
  return <ArchiveClient locations={locations} />
}
