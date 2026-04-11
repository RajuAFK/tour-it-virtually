'use client'

const CATEGORIES = [
  { id: 'all', label: 'All Places', icon: 'All' },
  { id: 'world heritage', label: 'World Heritage', icon: 'WH' },
  { id: 'historical', label: 'Historical', icon: 'HI' },
  { id: 'pilgrimages', label: 'Pilgrimages', icon: 'PI' },
  { id: 'adventure', label: 'Adventure', icon: 'AD' },
  { id: 'get aways', label: 'Get Aways', icon: 'GA' },
  { id: 'unexplored', label: 'Unexplored', icon: 'UN' },
  { id: 'places of worship', label: 'Places of Worship', icon: 'PW' },
]

interface CategoryFilterProps {
  selected: string
  onChange: (cat: string) => void
  counts: Record<string, number>
}

export default function CategoryFilter({ selected, onChange, counts }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {CATEGORIES.map((category) => {
        const count =
          category.id === 'all' ? Object.values(counts).reduce((total, value) => total + value, 0) : (counts[category.id] ?? 0)
        const active = selected === category.id

        return (
          <button
            key={category.id}
            onClick={() => onChange(category.id)}
            className={`group flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-medium transition-[color,background-color,border-color,box-shadow] duration-150 ${
              active
                ? 'border-slate-900 bg-slate-900 text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)]'
                : 'border-slate-200 bg-white/90 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900'
            }`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[0.65rem] font-semibold tracking-[0.14em] ${
                active ? 'bg-white/12 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {category.icon}
            </span>
            <span>{category.label}</span>
            {count > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[0.7rem] ${
                  active ? 'bg-white/12 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
