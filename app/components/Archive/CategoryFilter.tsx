'use client'

const CATEGORIES = [
  { id: 'all', label: 'All Places', emoji: '🌏' },
  { id: 'world heritage', label: 'World Heritage', emoji: '🏛' },
  { id: 'historical', label: 'Historical', emoji: '🏯' },
  { id: 'pilgrimages', label: 'Pilgrimages', emoji: '🛕' },
  { id: 'adventure', label: 'Adventure', emoji: '⛰' },
  { id: 'get aways', label: 'Get Aways', emoji: '🌴' },
  { id: 'unexplored', label: 'Unexplored', emoji: '🔭' },
  { id: 'places of worship', label: 'Places of Worship', emoji: '🕌' },
]

interface CategoryFilterProps {
  selected: string
  onChange: (cat: string) => void
  counts: Record<string, number>
}

export default function CategoryFilter({ selected, onChange, counts }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const count = cat.id === 'all' ? Object.values(counts).reduce((a, b) => a + b, 0) : (counts[cat.id] ?? 0)
        const active = selected === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              active
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900 shadow-sm'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
            {count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
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
