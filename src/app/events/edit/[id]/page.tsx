"use client"
import React, { use } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EventForm } from '@/components/events/EventForm'
import { useEvent, useUpdateEvent } from '@/lib/hooks'
import type { UpdateEventInput } from '@/lib/validations/event.schemas'

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  const { data: event, isLoading, error } = useEvent(id)
  const updateEventMutation = useUpdateEvent()

  const handleSubmit = async (data: UpdateEventInput) => {
    try {
      await updateEventMutation.mutateAsync({ id, data })
      // Redirect to the event's detail page
      router.push(`/events/${id}`)
    } catch (error) {
      console.error('Failed to update event:', error)
      // Error handling is done in the mutation hook
    }
  }

  const handleCancel = () => {
    router.push(`/events/${id}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <main className="max-w-4xl mx-auto px-6 py-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span>Loading event...</span>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <main className="max-w-4xl mx-auto px-6 py-8">
          <Card className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-400 mb-2">Event Not Found</h2>
              <p className="text-slate-400 mb-4">
                {error?.message || 'The event you are looking for does not exist or you do not have permission to edit it.'}
              </p>
              <Button variant="primary" onClick={() => router.push('/events')}>
                Back to Events
              </Button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  // Transform event data for the form
  const defaultValues = {
    title: event.title,
    description: event.description,
    excerpt: event.excerpt || undefined,
    startDateTime: event.startDateTime ? new Date(event.startDateTime).toISOString().slice(0, 16) : undefined,
    endDateTime: event.endDateTime ? new Date(event.endDateTime).toISOString().slice(0, 16) : undefined,
    timezone: event.timezone,
    location: event.location,
    capacity: event.capacity || undefined,
    status: event.status,
    visibility: event.visibility,
    price: event.price || undefined,
    images: event.images,
    categoryId: event.categoryId || undefined,
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Edit Event</h1>
            <p className="text-slate-400 mt-1">
              Update the details for "{event.title}"
            </p>
          </div>
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
        </div>

        {/* Form */}
        <Card className="p-6">
          <EventForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updateEventMutation.isPending}
            submitText="Update Event"
          />
        </Card>

        {/* Loading overlay */}
        {updateEventMutation.isPending && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span>Updating event...</span>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
