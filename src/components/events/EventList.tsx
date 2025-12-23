import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Card from '@/components/ui/Card'

type EventRow = {
  id: string
  title: string
  date?: string
  location?: string
  ticketsSold?: number
  status?: string
}

type Props = {
  events: EventRow[]
  loading?: boolean
}

// Generate colored avatar based on event title
const getEventAvatar = (title: string) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500'
  ]
  const colorIndex = title.charCodeAt(0) % colors.length
  const initial = title.charAt(0).toUpperCase()
  
  return (
    <div className={`w-10 h-10 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-semibold text-sm`}>
      {initial}
    </div>
  )
}

// Status badge component
const StatusBadge = ({ status }: { status?: string }) => {
  const getStatusStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(status)}`}>
      {status || 'draft'}
    </span>
  )
}

export const EventList: React.FC<Props> = ({ events, loading = false }) => {
  const [view, setView] = useState<'list' | 'grid'>('list')
  
  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div role="status" aria-live="polite" className="py-4 text-center text-slate-400">Loading events...</div>
      ) : null}
      
      <div className="flex items-center justify-end gap-2 mb-4">
        <button 
          aria-pressed={view === 'list'} 
          aria-label="list-view" 
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            view === 'list' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          onClick={() => setView('list')}
        >
          List
        </button>
        <button 
          aria-pressed={view === 'grid'} 
          aria-label="grid-view" 
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            view === 'grid' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          onClick={() => setView('grid')}
        >
          Grid
        </button>
      </div>

      {view === 'list' ? (
        <div className="bg-slate-900/50 rounded-lg border border-slate-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-400 font-medium py-4 px-6">Event</th>
                <th className="text-left text-slate-400 font-medium py-4 px-6">Date & Time</th>
                <th className="text-left text-slate-400 font-medium py-4 px-6">Location</th>
                <th className="text-left text-slate-400 font-medium py-4 px-6">Tickets</th>
                <th className="text-left text-slate-400 font-medium py-4 px-6">Status</th>
                <th className="text-left text-slate-400 font-medium py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-full animate-pulse" />
                        <div className="h-4 bg-slate-800 rounded animate-pulse w-32" />
                      </div>
                    </td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-800 rounded animate-pulse w-24" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-800 rounded animate-pulse w-28" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-800 rounded animate-pulse w-16" /></td>
                    <td className="py-4 px-6"><div className="h-6 bg-slate-800 rounded-full animate-pulse w-20" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-800 rounded animate-pulse w-12" /></td>
                  </tr>
                ))
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                        📅
                      </div>
                      <p>No events found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                events.map((event, index) => (
                  <motion.tr 
                    key={event.id} 
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {getEventAvatar(event.title)}
                        <div>
                          <Link 
                            href={`/events/${event.id}`}
                            className="font-medium text-slate-100 hover:text-blue-400 transition-colors"
                          >
                            {event.title}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-300">{event.date || 'TBD'}</td>
                    <td className="py-4 px-6 text-slate-300">{event.location || 'TBD'}</td>
                    <td className="py-4 px-6 text-slate-300">{event.ticketsSold || 0}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="py-4 px-6">
                      <Link 
                        href={`/events/edit/${event.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-full" />
                  <div className="flex-1">
                    <div className="h-5 bg-slate-800 rounded mb-2" />
                    <div className="h-4 bg-slate-800 rounded w-2/3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-800 rounded" />
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                </div>
              </Card>
            ))
          ) : events.length === 0 ? (
            <Card className="col-span-full text-center py-12 text-slate-400">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-2xl">
                  📅
                </div>
                <div>
                  <h3 className="font-medium text-slate-300 mb-1">No events found</h3>
                  <p className="text-sm">Create your first event to get started</p>
                </div>
              </div>
            </Card>
          ) : (
            events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  {getEventAvatar(event.title)}
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/events/${event.id}`}
                      className="font-semibold text-slate-100 hover:text-blue-400 transition-colors block truncate"
                    >
                      {event.title}
                    </Link>
                    <div className="text-sm text-slate-400 mt-1">
                      {event.date} • {event.location}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-300">
                    <span className="font-medium">{event.ticketsSold || 0}</span> tickets sold
                  </div>
                  <StatusBadge status={event.status} />
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <Link 
                    href={`/events/${event.id}`}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    View Details
                  </Link>
                  <Link 
                    href={`/events/edit/${event.id}`}
                    className="text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </Card>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default EventList
