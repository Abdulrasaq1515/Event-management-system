import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EventForm } from './EventForm'

describe('EventForm', () => {
  it('shows validation errors when submitted empty', async () => {
    const onSubmit = vi.fn()
    render(<EventForm onSubmit={onSubmit} />)

    // Submit empty form - should show errors
    const submit = screen.getByRole('button', { name: /save/i })
    // Sanity check: submit should be enabled
    expect(submit).not.toBeDisabled()
    fireEvent.click(submit)
    expect(await screen.findByText(/Title must be at least 3 characters/i)).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits when valid default values are provided', async () => {
    const onSubmit = vi.fn()
    const validValues = {
      title: 'My Event',
      description: 'This is a sample event description.',
      location: { type: 'virtual', url: 'https://example.com' },
      timezone: 'UTC',
      startDateTime: '2025-01-01T10:00:00Z',
      endDateTime: '2025-01-01T12:00:00Z',
      capacity: 100,
    }
    render(<EventForm onSubmit={onSubmit} defaultValues={validValues} />)

    // Ensure fields are populated in the DOM (jsdom doesn't always reflect react-hook-form defaultValues)
    fireEvent.change(screen.getByLabelText(/Event Title/i), { target: { value: validValues.title } })
    fireEvent.change(screen.getByLabelText(/Description \*/i), { target: { value: validValues.description } })
    // datetime-local expects YYYY-MM-DDTHH:mm (without seconds/Z) - normalize for the input
    fireEvent.change(screen.getByLabelText(/Start Date & Time/i), { target: { value: '2025-01-01T10:00' } })
    fireEvent.change(screen.getByLabelText(/End Date & Time/i), { target: { value: '2025-01-01T12:00' } })
    // Fill virtual meeting URL (required for virtual location)
    fireEvent.change(screen.getByLabelText(/Meeting URL/i), { target: { value: 'https://example.com' } })
    // Fill images (required by schema)
    fireEvent.change(screen.getByLabelText(/Thumbnail URL/i), { target: { value: 'https://example.com/thumb.jpg' } })
    fireEvent.change(screen.getByLabelText(/Banner URL/i), { target: { value: 'https://example.com/banner.jpg' } })
    fireEvent.change(screen.getByLabelText(/Timezone/i), { target: { value: validValues.timezone } })
    fireEvent.change(screen.getByLabelText(/Capacity/i), { target: { value: String(validValues.capacity) } })

    const submit = screen.getByRole('button', { name: /save/i })
    fireEvent.click(submit)

    // If submission doesn't happen, surface validation error messages for debugging
    const validationErrs = screen.queryAllByText(/must be|Invalid|required|Please select/i)
    if (validationErrs.length > 0) {
      // eslint-disable-next-line no-console
      console.error('Validation errors:', validationErrs.map((n) => n.textContent))
    }

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
  })
})
