import Image from 'next/image'
import Link from 'next/link'
import type { Location } from '@/app/components/Earth/types'

const CATEGORY_COLORS: Record<string, string> = {
  adventure: 'bg-emerald-100 text-emerald-700',
  unexplored: 'bg-purple-100 text-purple-700',
  pilgrimages: 'bg-amber-100 text-amber-700',
  'places of worship': 'bg-orange-100 text-orange-700',
  historical: 'bg-blue-100 text-blue-700',
  'world heritage': 'bg-rose-100 text-rose-700',
  'get aways': 'bg-teal-100 text-teal-700',
}

export default function LocationCard({ location }: { location: Location }) {
  const catClass = CATEGORY_COLORS[location.category] ?? 'bg-sky-100 text-sky-700'

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        <Image
          src={location.thumbnail}
          alt={location.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <span
          className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${catClass}`}
        >
          {location.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-sky-600 transition-colors">
          {location.name}
        </h3>
        <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          {location.city}, {location.state}
        </p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <Link
            href={`/earth?location=${location.id}`}
            className="text-xs text-sky-600 font-medium hover:text-sky-700 flex items-center gap-1 transition-colors"
          >
            <span>🌐</span> View on Globe
          </Link>
          <a
            href={location.affiliate.hotel}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            Book →
          </a>
        </div>
      </div>
    </article>
  )
}
