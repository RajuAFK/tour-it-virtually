'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const path = usePathname()

  return (
    <nav
      className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-4 md:px-6"
      style={{
        background: 'linear-gradient(to bottom, rgba(10,10,20,0.7) 0%, transparent 100%)',
      }}
    >
      <Link href="/earth" className="flex items-center gap-2 group">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          T
        </div>
        <span className="text-sm font-semibold tracking-wide text-white transition-colors group-hover:text-sky-300">
          TourItVirtually
        </span>
      </Link>

      <div
        className="flex items-center gap-1 rounded-full p-1"
        style={{
          background: 'rgba(10,14,28,0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
        }}
      >
        <NavLink href="/earth" active={path === '/earth' || path === '/'}>
          Globe
        </NavLink>
        <NavLink href="/archive" active={path === '/archive'}>
          Archive
        </NavLink>
      </div>

      <div className="hidden text-xs text-white/40 sm:block">Explore · Discover · Tour</div>
    </nav>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
        active
          ? 'border border-white/12 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
          : 'text-white/55 hover:bg-white/[0.06] hover:text-white/90'
      }`}
      style={active ? { backdropFilter: 'blur(10px)' } : undefined}
    >
      {children}
    </Link>
  )
}
