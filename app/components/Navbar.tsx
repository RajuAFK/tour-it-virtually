'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const path = usePathname()

  return (
    <nav
      className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4"
      style={{
        background: 'linear-gradient(to bottom, rgba(10,10,20,0.7) 0%, transparent 100%)',
      }}
    >
      {/* Logo */}
      <Link href="/earth" className="flex items-center gap-2 group">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          T
        </div>
        <span className="text-white font-semibold text-sm tracking-wide group-hover:text-sky-300 transition-colors">
          TourItVirtually
        </span>
      </Link>

      {/* Nav links — no outer pill wrapper, only the active link gets a pill */}
      <div className="flex items-center gap-1">
        <NavLink href="/earth" active={path === '/earth' || path === '/'}>
          🌍 Globe
        </NavLink>
        <NavLink href="/archive" active={path === '/archive'}>
          🗂 Archive
        </NavLink>
      </div>

      {/* Right side */}
      <div className="text-white/40 text-xs hidden sm:block">
        Explore · Discover · Tour
      </div>
    </nav>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
        active
          ? 'bg-white/15 text-white border border-white/20'
          : 'text-white/55 hover:text-white/90 hover:bg-white/08'
      }`}
      style={active ? { backdropFilter: 'blur(10px)' } : undefined}
    >
      {children}
    </Link>
  )
}
