"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/layout/Header'
import { EventForm } from '@/components/events/EventForm'
import { useCreateEvent } from '@/lib/hooks'
import type { CreateEventInput } from '@/lib/validations/event.schemas'

export default function NewEventPage() {
  const router = useRouter()
  const createEventMutation = useCreateEvent()

  const handleSubmit = async (data: CreateEventInput) => {
    try {
      const newEvent = await createEventMutation.mutateAsync(data)
      // Redirect to the new event's detail page
      router.push(`/events/${newEvent.id}`)
    } catch (error) {
      console.error('Failed to create event:', error)
      // Error handling is done in the mutation hook
    }
  }

  const handleCancel = () => {
    router.push('/events')
  }

  const breadcrumbs = [
    { label: 'Events', href: '/events' },
    { label: 'Create New Event' }
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      <Header breadcrumbs={breadcrumbs} />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Create New Event</h1>
          <p className="text-slate-400">
            Fill in the details below to create your event and start managing attendees
          </p>
        </div>

        {/* Form */}
        <Card className="p-8">
          <EventForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createEventMutation.isPending}
            submitText="Create Event"
          />
        </Card>

        {/* Loading overlay */}
        {createEventMutation.isPending && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="text-slate-200">Creating event...</span>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}