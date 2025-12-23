import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

type BreadcrumbItem = {
  label: string
  href?: string
}

type Props = {
  breadcrumbs?: BreadcrumbItem[]
}

export const Header: React.FC<Props> = ({ breadcrumbs = [] }) => {
  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-slate-100 hover:text-blue-400 transition-colors">
              EventHub
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/events" 
                className="text-slate-300 hover:text-slate-100 font-medium transition-colors"
              >
                Events
              </Link>
              <Link 
                href="/analytics" 
                className="text-slate-300 hover:text-slate-100 font-medium transition-colors"
              >
                Analytics
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <input
                placeholder="Search events, attendees..."
                className="px-4 py-2 rounded-lg bg-slate-800/50 text-slate-200 placeholder-slate-500 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-64"
              />
            </div>
            
            <Link href="/events/new">
              <Button variant="primary" className="font-medium">
                + Create Event
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors">
                🔔
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                U
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800/50">
            <Link href="/" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
              Home
            </Link>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <span className="text-slate-600">/</span>
                {item.href ? (
                  <Link 
                    href={item.href} 
                    className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-200 text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
