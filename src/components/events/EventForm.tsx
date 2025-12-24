"use client"
import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEventSchema, type CreateEventInput } from '@/lib/validations/event.schemas'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type Props = {
  defaultValues?: Partial<CreateEventInput>
  onSubmit: (data: CreateEventInput) => Promise<void> | void
  onCancel?: () => void
  isSubmitting?: boolean
  submitText?: string
}

export const EventForm: React.FC<Props> = ({ 
  defaultValues = {}, 
  onSubmit, 
  onCancel,
  isSubmitting = false,
  submitText = "Save Event"
}) => {
  const [locationType, setLocationType] = useState<'physical' | 'virtual'>(
    defaultValues.location?.type || 'virtual'
  )

  const { 
    register, 
    handleSubmit, 
    control,
    watch,
    setValue,
    formState: { errors, isDirty } 
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema) as any,
    defaultValues: {
      visibility: 'public',
      status: 'draft',
      timezone: 'UTC',
      images: {
        thumbnail: 'https://via.placeholder.com/400x300',
        banner: 'https://via.placeholder.com/1200x400',
      },
      ...defaultValues,
      location: defaultValues.location || {
        type: 'virtual',
        url: '',
      }
    } as CreateEventInput,
  })

  const watchedStartDate = watch('startDateTime')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-200 border-b border-slate-700 pb-2">
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-200 mb-1">
              Event Title *
            </label>
            <input 
              id="title" 
              {...register('title')} 
              className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter event title"
            />
            {errors.title && (
              <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-200 mb-1">
              Description *
            </label>
            <textarea 
              id="description" 
              {...register('description')} 
              className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
              rows={4}
              placeholder="Describe your event..."
            />
            {errors.description && (
              <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-slate-200 mb-1">
              Short Description
            </label>
            <input 
              id="excerpt" 
              {...register('excerpt')} 
              className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Brief summary for event listings"
            />
            {errors.excerpt && (
              <p className="text-xs text-red-400 mt-1">{errors.excerpt.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Date and Time */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-200 border-b border-slate-700 pb-2">
          Date & Time
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="startDateTime" className="block text-sm font-medium text-slate-200 mb-1">
              Start Date & Time *
            </label>
            <input 
              id="startDateTime" 
              type="datetime-local" 
              {...register('startDateTime')} 
              className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.startDateTime && (
              <p className="text-xs text-red-400 mt-1">{errors.startDateTime.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="endDateTime" className="block text-sm font-medium text-slate-200 mb-1">
              End Date & Time *
            </label>
            <input 
              id="endDateTime" 
              type="datetime-local" 
              {...register('endDateTime')} 
              className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              min={watchedStartDate}
            />
            {errors.endDateTime && (
              <p className="text-xs text-red-400 mt-1">{errors.endDateTime.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-slate-200 mb-1">
              Timezone *
            </label>
            <select 
              id="timezone" 
              {...register('timezone')} 
              className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Shanghai">Shanghai</option>
            </select>
            {errors.timezone && (
              <p className="text-xs text-red-400 mt-1">{errors.timezone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-200 border-b border-slate-700 pb-2">
          Location
        </h3>
        
        <div className="space-y-4">
          {/* Location Type Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Location Type *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="virtual"
                  checked={locationType === 'virtual'}
                  onChange={(e) => {
                    setLocationType(e.target.value as 'virtual');
                    // Reset location field when switching types
                    setValue('location', { type: 'virtual', url: '' });
                  }}
                  className="mr-2"
                />
                <span className="text-slate-200">Virtual Event</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="physical"
                  checked={locationType === 'physical'}
                  onChange={(e) => {
                    setLocationType(e.target.value as 'physical');
                    // Reset location field when switching types
                    setValue('location', { type: 'physical', address: '', city: '', country: '' });
                  }}
                  className="mr-2"
                />
                <span className="text-slate-200">Physical Location</span>
              </label>
            </div>
          </div>

          {/* Virtual Location Fields */}
          {locationType === 'virtual' && (
            <>
              <input type="hidden" {...register('location.type')} value="virtual" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="virtualUrl" className="block text-sm font-medium text-slate-200 mb-1">
                    Meeting URL *
                  </label>
                  <input 
                    id="virtualUrl"
                    {...register('location.url')}
                    className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="https://zoom.us/j/..."
                  />
                  {errors.location?.url && (
                    <p className="text-xs text-red-400 mt-1">{errors.location.url.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="platform" className="block text-sm font-medium text-slate-200 mb-1">
                    Platform
                  </label>
                  <input 
                    id="platform"
                    {...register('location.platform')}
                    className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Zoom, Teams, etc."
                  />
                </div>
              </div>
            </>
          )}

          {/* Physical Location Fields */}
          {locationType === 'physical' && (
            <>
              <input type="hidden" {...register('location.type')} value="physical" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-slate-200 mb-1">
                    Address *
                  </label>
                  <input 
                    id="address"
                    {...register('location.address')}
                    className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="123 Main St, Suite 100"
                  />
                  {errors.location?.address && (
                    <p className="text-xs text-red-400 mt-1">{errors.location.address.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-slate-200 mb-1">
                    City *
                  </label>
                  <input 
                    id="city"
                    {...register('location.city')}
                    className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="San Francisco"
                  />
                  {errors.location?.city && (
                    <p className="text-xs text-red-400 mt-1">{errors.location.city.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-slate-200 mb-1">
                    Country *
                  </label>
                  <input 
                    id="country"
                    {...register('location.country')}
                    className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="United States"
                  />
                  {errors.location?.country && (
                    <p className="text-xs text-red-400 mt-1">{errors.location.country.message}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Event Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-200 border-b border-slate-700 pb-2">
          Event Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-200 mb-1">
              Status *
            </label>
            <select 
              id="status" 
              {...register('status')} 
              className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            {errors.status && (
              <p className="text-xs text-red-400 mt-1">{errors.status.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-slate-200 mb-1">
              Capacity
            </label>
            <input 
              id="capacity" 
              type="number" 
              min="1"
              {...register('capacity', { valueAsNumber: true })} 
              className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="100"
            />
            {errors.capacity && (
              <p className="text-xs text-red-400 mt-1">{errors.capacity.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-slate-200 mb-1">
              Visibility *
            </label>
            <select 
              id="visibility" 
              {...register('visibility')} 
              className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
            </select>
            {errors.visibility && (
              <p className="text-xs text-red-400 mt-1">{errors.visibility.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-slate-200 mb-1">
              Category
            </label>
            <select 
              id="categoryId" 
              {...register('categoryId')} 
              className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              <option value="conference">Conference</option>
              <option value="workshop">Workshop</option>
              <option value="meetup">Meetup</option>
              <option value="webinar">Webinar</option>
              <option value="networking">Networking</option>
            </select>
            {errors.categoryId && (
              <p className="text-xs text-red-400 mt-1">{errors.categoryId.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-200 border-b border-slate-700 pb-2">
          Pricing (Optional)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="priceType" className="block text-sm font-medium text-slate-200 mb-1">
              Price Type
            </label>
            <Controller
              name="price.type"
              control={control}
              render={({ field }) => (
                <select 
                  {...field}
                  className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">No Pricing</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              )}
            />
          </div>

          <div>
            <label htmlFor="priceAmount" className="block text-sm font-medium text-slate-200 mb-1">
              Amount
            </label>
            <Controller
              name="price.amount"
              control={control}
              render={({ field }) => (
                <input 
                  {...field}
                  type="number" 
                  min="0"
                  step="0.01"
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="0.00"
                />
              )}
            />
          </div>

          <div>
            <label htmlFor="priceCurrency" className="block text-sm font-medium text-slate-200 mb-1">
              Currency
            </label>
            <Controller
              name="price.currency"
              control={control}
              render={({ field }) => (
                <select 
                  {...field}
                  className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              )}
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-200 border-b border-slate-700 pb-2">
          Images
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-slate-200 mb-1">
              Thumbnail URL *
            </label>
            <input 
              id="thumbnail"
              {...register('images.thumbnail')}
              className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="https://example.com/thumbnail.jpg"
            />
            {errors.images?.thumbnail && (
              <p className="text-xs text-red-400 mt-1">{errors.images.thumbnail.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="banner" className="block text-sm font-medium text-slate-200 mb-1">
              Banner URL *
            </label>
            <input 
              id="banner"
              {...register('images.banner')}
              className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="https://example.com/banner.jpg"
            />
            {errors.images?.banner && (
              <p className="text-xs text-red-400 mt-1">{errors.images.banner.message}</p>
            )}
          </div>
        </div>
        
        <p className="text-xs text-slate-400">
          For now, please provide direct URLs to your images. Image upload functionality will be added soon.
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700">
        {onCancel && (
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          variant="primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  )
}

export default EventForm
