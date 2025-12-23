"use client"
import React from 'react'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import EventActions from './EventActions'
import { useRouter } from 'next/navigation'

type Props = {
  id: string
  title: string
  date?: string
  location?: string
  ticketsSold?: number
  status?: string
}

export const EventCard: React.FC<Props> = ({ id, title, date, location, ticketsSold, status }) => {
  const router = useRouter()
  return (
    <tr className="border-t border-slate-800 hover:bg-slate-900/40 transition-colors items-center">
      <td className="py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm">E</div>
          <Link href={`/events/${id}`} className="truncate text-slate-100 hover:underline">{title}</Link>
        </div>
      </td>
      <td className="py-3">{date}</td>
      <td className="py-3">{location}</td>
      <td className="py-3">{ticketsSold ?? 0}</td>
      <td className="py-3">
        <div className="flex items-center justify-between">
          <span className="px-2 py-1 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.03)' }}>{status}</span>
          <EventActions onEdit={() => router.push(`/events/edit/${id}`)} />
        </div>
      </td>
    </tr>
  )
}

export default EventCard
