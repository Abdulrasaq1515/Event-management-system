"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EventList } from '@/components/events/EventList'
import { Header } from '@/components/layout/Header'
import { useEvents } from '@/lib/hooks'
import type { EventQueryParams } from '@/types/event.types'

export default function EventsPage() {
  const [filters, setFilters] = useState<EventQueryParams>({
    page: 1,
    limit: 20,
  })

  // Use the custom hook to fetch events
  const { data: eventsResponse, isLoading, error } = useEvents(filters)

  const events = eventsResponse?.data || []
  const pagination = eventsResponse?.pagination

  // Transform events to match EventList component expectations
  const transformedEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.startDateTime ? new Date(event.startDateTime).toLocaleDateString() : '',
    location: event.location?.type === 'physical' 
      ? `${event.location.city}, ${event.location.country}`
      : event.location?.type === 'virtual' 
        ? 'Virtual Event'
        : 'TBD',
    ticketsSold: event.currentAttendees || 0,
    status: event.status || 'draft',
  }))

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      page: 1, // Reset to first page when searching
    }))
  }

  const handleFilterChange = (newFilters: Partial<EventQueryParams>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  // Calculate stats from the current data
  const totalEvents = pagination?.total || 0
  const publishedEvents = events.filter(e => e.status === 'published').length
  const draftEvents = events.filter(e => e.status === 'draft').length
  const totalAttendees = events.reduce((sum, e) => sum + (e.currentAttendees || 0), 0)

  const breadcrumbs = [
    { label: 'Events' }
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      <Header breadcrumbs={breadcrumbs} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Events Dashboard</h1>
          <p className="text-slate-400">Manage and track all your events in one place</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Events" 
            value={totalEvents} 
            delta={totalEvents > 0 ? `+${Math.round((publishedEvents / totalEvents) * 100)}%` : undefined}
            icon="📅"
            trend="up"
          />
          <StatCard 
            title="Published Events" 
            value={publishedEvents} 
            delta={publishedEvents > 0 ? "+12%" : undefined}
            icon="🚀"
            trend="up"
          />
          <StatCard 
            title="Draft Events" 
            value={draftEvents} 
            delta={draftEvents > 0 ? "+5%" : undefined}
            icon="📝"
            trend="neutral"
          />
          <StatCard 
            title="Total Attendees" 
            value={totalAttendees} 
            delta={totalAttendees > 0 ? "+24%" : undefined}
            icon="👥"
            trend="up"
          />
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
              <h2 className="text-xl font-semibold text-slate-100">All Events</h2>
              
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <input 
                  className="w-full px-4 py-2.5 pl-10 rounded-lg bg-slate-800/50 text-slate-200 placeholder-slate-500 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                  placeholder="Search events..."
                  onChange={(e) => {
                    const value = e.target.value
                    // Debounce search to avoid too many API calls
                    const timeoutId = setTimeout(() => handleSearch(value), 300)
                    return () => clearTimeout(timeoutId)
                  }}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  🔍
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Status Filter */}
              <select 
                className="px-4 py-2.5 rounded-lg bg-slate-800/50 text-slate-200 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ status: (e.target.value || undefined) as any })}
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>

              {/* Visibility Filter */}
              <select 
                className="px-4 py-2.5 rounded-lg bg-slate-800/50 text-slate-200 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={filters.visibility || ''}
                onChange={(e) => handleFilterChange({ visibility: (e.target.value || undefined) as any })}
              >
                <option value="">All Visibility</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
              </select>
              
              <Link href="/events/new">
                <Button variant="primary" className="font-medium">
                  + Create Event
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Events List */}
        <Card>
          {error ? (
            <div className="py-12 text-center">
              <div className="text-red-400 text-lg mb-2">⚠️ Error loading events</div>
              <div className="text-slate-400">{error.message}</div>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  {isLoading ? 'Loading...' : `${totalEvents} events total`}
                </div>
                
                {/* Results per page */}
                <select 
                  className="px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-200 border border-slate-700/50 text-sm focus:border-blue-500/50 focus:outline-none transition-all"
                  value={filters.limit || 20}
                  onChange={(e) => handleFilterChange({ limit: parseInt(e.target.value) })}
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>

              <EventList events={transformedEvents} loading={isLoading} />

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      disabled={!pagination.hasPrev}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, pagination.page - 2) + i
                      if (pageNum > pagination.totalPages) return null
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "primary" : "ghost"}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    
                    <Button 
                      variant="ghost" 
                      disabled={!pagination.hasNext}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </main>
    </div>
  )
}
