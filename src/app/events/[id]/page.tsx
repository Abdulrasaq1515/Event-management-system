"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/layout/Header'
import { NFTAssociation } from '@/components/web3'
import { useEvent, useDeleteEvent, useUpdateEvent } from '@/lib/hooks'
import { formatDate, formatTime } from '@/lib/utils/date'
import type { NftMetadata } from '@/lib/services/nft.service'

type Props = { params: { id: string } }

export default function EventDetailPage({ params }: Props) {
  const { id } = params
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showNFTAssociation, setShowNFTAssociation] = useState(false)
  
  const { data: event, isLoading, error } = useEvent(id)
  const deleteEventMutation = useDeleteEvent()
  const updateEventMutation = useUpdateEvent()

  const handleEdit = () => {
    router.push(`/events/edit/${id}`)
  }

  const handleDelete = async () => {
    try {
      await deleteEventMutation.mutateAsync(id)
      router.push('/events')
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  const handleNFTAssociate = async (nft: NftMetadata) => {
    try {
      // Transform NFT metadata to match the expected format
      const nftMetadata = {
        mintAddress: nft.mint || nft.tokenAddress || '',
        collectionAddress: '', // Could be extracted from NFT data if available
        metadata: {
          name: nft.name || '',
          symbol: '', // Could be extracted from NFT data if available
          image: nft.image || '',
          attributes: nft.raw?.attributes || []
        }
      }

      await updateEventMutation.mutateAsync({
        id,
        data: { nftMetadata }
      })
      
      setShowNFTAssociation(false)
    } catch (error) {
      console.error('Failed to associate NFT:', error)
    }
  }

  const handleNFTRemove = async () => {
    try {
      await updateEventMutation.mutateAsync({
        id,
        data: { nftMetadata: undefined }
      })
    } catch (error) {
      console.error('Failed to remove NFT:', error)
    }
  }

  if (isLoading) {
    const breadcrumbs = [
      { label: 'Events', href: '/events' },
      { label: 'Loading...' }
    ]

    return (
      <div className="min-h-screen bg-slate-950">
        <Header breadcrumbs={breadcrumbs} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-slate-200">Loading event...</span>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  if (error || !event) {
    const breadcrumbs = [
      { label: 'Events', href: '/events' },
      { label: 'Event Not Found' }
    ]

    return (
      <div className="min-h-screen bg-slate-950">
        <Header breadcrumbs={breadcrumbs} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Card className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-400 mb-2">Event Not Found</h2>
              <p className="text-slate-400 mb-4">
                {error?.message || 'The event you are looking for does not exist.'}
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

  const startDate = new Date(event.startDateTime)
  const endDate = new Date(event.endDateTime)
  const isVirtual = event.location?.type === 'virtual'
  const isPhysical = event.location?.type === 'physical'

  // Extract current NFT metadata if it exists
  const currentNFT = event.metadata && typeof event.metadata === 'object' && 'mintAddress' in event.metadata
    ? {
        name: event.metadata.metadata?.name || 'Associated NFT',
        description: event.metadata.metadata?.description || '',
        image: event.metadata.metadata?.image || '',
        tokenAddress: event.metadata.mintAddress,
        mint: event.metadata.mintAddress,
        metadataUri: '',
        raw: event.metadata
      } as NftMetadata
    : null

  const breadcrumbs = [
    { label: 'Events', href: '/events' },
    { label: event.title }
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      <Header breadcrumbs={breadcrumbs} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <Card className="p-6">
              {/* Event Image */}
              {event.images?.banner && (
                <div className="rounded-md overflow-hidden mb-6">
                  <img 
                    src={event.images.banner} 
                    alt={event.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/1200x400/334155/94a3b8?text=Event+Banner'
                    }}
                  />
                </div>
              )}

              {/* Title and Actions */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'published' ? 'bg-green-900 text-green-300' :
                      event.status === 'draft' ? 'bg-yellow-900 text-yellow-300' :
                      event.status === 'cancelled' ? 'bg-red-900 text-red-300' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {event.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.visibility === 'public' ? 'bg-blue-900 text-blue-300' :
                      event.visibility === 'private' ? 'bg-purple-900 text-purple-300' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {event.visibility}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-100 mb-2">{event.title}</h1>
                  {event.excerpt && (
                    <p className="text-slate-400 text-lg">{event.excerpt}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="secondary" onClick={handleEdit}>
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => setShowNFTAssociation(true)}>
                    {currentNFT ? 'Manage NFT' : 'Attach NFT'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-slate prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </Card>

            {/* Event Details */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">Event Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date & Time */}
                <div>
                  <h3 className="font-medium text-slate-200 mb-2">Date & Time</h3>
                  <div className="space-y-1 text-slate-400">
                    <p>
                      <span className="font-medium">Starts:</span> {formatDate(startDate)} at {formatTime(startDate)}
                    </p>
                    <p>
                      <span className="font-medium">Ends:</span> {formatDate(endDate)} at {formatTime(endDate)}
                    </p>
                    <p>
                      <span className="font-medium">Timezone:</span> {event.timezone}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="font-medium text-slate-200 mb-2">Location</h3>
                  <div className="space-y-1 text-slate-400">
                    {isVirtual && (
                      <>
                        <p className="font-medium text-blue-400">Virtual Event</p>
                        {event.location.platform && (
                          <p><span className="font-medium">Platform:</span> {event.location.platform}</p>
                        )}
                        {event.location.url && (
                          <p>
                            <span className="font-medium">Link:</span>{' '}
                            <a 
                              href={event.location.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              Join Event
                            </a>
                          </p>
                        )}
                      </>
                    )}
                    {isPhysical && (
                      <>
                        <p className="font-medium text-green-400">Physical Location</p>
                        <p>{event.location.address}</p>
                        <p>{event.location.city}, {event.location.country}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Capacity */}
                {event.capacity && (
                  <div>
                    <h3 className="font-medium text-slate-200 mb-2">Capacity</h3>
                    <div className="text-slate-400">
                      <p>{event.currentAttendees || 0} / {event.capacity} attendees</p>
                      <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min(((event.currentAttendees || 0) / event.capacity) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing */}
                {event.price && (
                  <div>
                    <h3 className="font-medium text-slate-200 mb-2">Pricing</h3>
                    <div className="text-slate-400">
                      {event.price.type === 'free' ? (
                        <p className="text-green-400 font-medium">Free Event</p>
                      ) : (
                        <p>
                          <span className="text-xl font-bold text-slate-200">
                            {event.price.amount} {event.price.currency}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* NFT Collection */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">NFT Collection</h2>
              {currentNFT ? (
                <div className="flex items-center gap-4 p-4 bg-green-900/20 border border-green-700 rounded-md">
                  {currentNFT.image && (
                    <img 
                      src={currentNFT.image}
                      alt={currentNFT.name || 'NFT'}
                      className="w-16 h-16 rounded-md object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/64x64/334155/94a3b8?text=NFT'
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-200">{currentNFT.name}</h3>
                    {currentNFT.description && (
                      <p className="text-sm text-slate-400 mt-1">{currentNFT.description}</p>
                    )}
                    <div className="text-xs text-slate-500 font-mono mt-1">
                      {currentNFT.tokenAddress ? 
                        `${currentNFT.tokenAddress.slice(0, 8)}...${currentNFT.tokenAddress.slice(-8)}` :
                        'Unknown Address'
                      }
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setShowNFTAssociation(true)}>
                    Manage
                  </Button>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-500">
                  No NFT Collection Attached
                  <div className="mt-2">
                    <Button variant="ghost" onClick={() => setShowNFTAssociation(true)}>
                      Attach NFT Collection
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Stats */}
            <Card className="p-6">
              <h3 className="font-medium text-slate-200 mb-4">Event Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-slate-100">
                    {event.currentAttendees || 0}
                  </div>
                  <div className="text-sm text-slate-400">Total Attendees</div>
                </div>
                
                <div>
                  <div className="text-lg font-semibold text-slate-200">
                    v{event.version}
                  </div>
                  <div className="text-sm text-slate-400">Version</div>
                </div>

                <div>
                  <div className="text-sm text-slate-200">
                    {formatDate(new Date(event.createdAt))}
                  </div>
                  <div className="text-sm text-slate-400">Created</div>
                </div>

                <div>
                  <div className="text-sm text-slate-200">
                    {formatDate(new Date(event.updatedAt))}
                  </div>
                  <div className="text-sm text-slate-400">Last Updated</div>
                </div>
              </div>
            </Card>

            {/* Organizer Info */}
            <Card className="p-6">
              <h3 className="font-medium text-slate-200 mb-4">Organizer</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {event.organizerId.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-slate-200">Event Organizer</div>
                  <div className="text-sm text-slate-400">ID: {event.organizerId.slice(0, 8)}...</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* NFT Association Modal */}
        {showNFTAssociation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-950 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-950 border-b border-slate-700 p-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-100">NFT Association</h2>
                <Button variant="ghost" onClick={() => setShowNFTAssociation(false)}>
                  ✕
                </Button>
              </div>
              
              <div className="p-6">
                <NFTAssociation
                  eventId={id}
                  currentNFT={currentNFT}
                  onNFTAssociate={handleNFTAssociate}
                  onNFTRemove={handleNFTRemove}
                />
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Delete Event</h3>
              <p className="text-slate-400 mb-4">
                Are you sure you want to delete "{event.title}"? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteEventMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleDelete}
                  disabled={deleteEventMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteEventMutation.isPending ? 'Deleting...' : 'Delete Event'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
