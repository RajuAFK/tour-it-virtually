import Image from 'next/image'
import Link from 'next/link'
import type { Location } from '@/app/components/Earth/types'

const CATEGORY_COLORS: Record<string, string> = {
  adventure: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  unexplored: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  pilgrimages: 'bg-amber-100 text-amber-700 border-amber-200',
  'places of worship': 'bg-orange-100 text-orange-700 border-orange-200',
  historical: 'bg-blue-100 text-blue-700 border-blue-200',
  'world heritage': 'bg-rose-100 text-rose-700 border-rose-200',
  'get aways': 'bg-teal-100 text-teal-700 border-teal-200',
}

export default function LocationCard({ location }: { location: Location }) {
  const categoryClass = CATEGORY_COLORS[location.category] ?? 'bg-sky-100 text-sky-700 border-sky-200'

  return (
    <article className="group h-full overflow-hidden rounded-[1.9rem] border border-white/70 bg-white/82 shadow-[0_16px_50px_rgba(15,23,42,0.06)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_80px_rgba(15,23,42,0.1)]">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={location.thumbnail}
          alt={location.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.14)_38%,rgba(15,23,42,0.72)_100%)]" />
        <span className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-[0.72rem] font-semibold capitalize ${categoryClass}`}>
          {location.category}
        </span>

        <div className="absolute inset-x-4 bottom-4">
          <p className="text-xs uppercase tracking-[0.16em] text-white/58">
            {location.city}, {location.state}
          </p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight text-white">{location.name}</h3>
        </div>
      </div>

      <div className="flex h-[calc(100%-14rem)] flex-col p-5">
        <p className="text-sm leading-7 text-slate-600">{location.description}</p>

        <div className="mt-5 rounded-[1.35rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Why enter here</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Jump back into the globe already aligned to this destination, then open the immersive tour from its exact location context.
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <Link
            href={`/earth?location=${location.id}`}
            className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
          >
            Open on globe
          </Link>
          <a
            href={location.affiliate.hotel}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
          >
            Book stay
          </a>
        </div>
      </div>
    </article>
  )
}
