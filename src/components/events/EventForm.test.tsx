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
    fireEvent.click(submit)
    expect(await screen.findByText(/Title must be at least 3 characters/i)).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits when valid default values are provided', async () => {
    const onSubmit = vi.fn()
    const validValues = {
      title: 'My Event',
      description: 'This is a sample event description.',
      timezone: 'UTC',
      startDateTime: '2025-01-01T10:00:00Z',
      endDateTime: '2025-01-01T12:00:00Z',
      capacity: 100,
    }
    render(<EventForm onSubmit={onSubmit} defaultValues={validValues} />)
    const submit = screen.getByRole('button', { name: /save/i })
    fireEvent.click(submit)
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
  })
})
