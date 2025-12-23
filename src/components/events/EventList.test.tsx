import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EventList from './EventList'

const events = [
  { id: '1', title: 'Test Event', date: '2025-01-01', location: 'Venue', ticketsSold: 100, status: 'Upcoming' },
  { id: '2', title: 'Second Event', date: '2025-02-01', location: 'Hall', ticketsSold: 50, status: 'Upcoming' },
]

describe('EventList', () => {
  it('renders table by default and toggles to grid view', async () => {
    render(<EventList events={events} />)
    // Table view should render
    expect(screen.getByRole('table')).toBeTruthy()

    // Click grid toggle
    const gridBtn = screen.getByRole('button', { name: /grid-view/i })
    fireEvent.click(gridBtn)

    // Cards should appear
    expect(await screen.findByText(/Test Event/)).toBeTruthy()
    expect(await screen.findByText(/Second Event/)).toBeTruthy()
  })

  it('toggle buttons reflect aria-pressed states', () => {
    render(<EventList events={events} />)
    const listBtn = screen.getByRole('button', { name: /list-view/i })
    const gridBtn = screen.getByRole('button', { name: /grid-view/i })
    // Default: list pressed
    expect(listBtn.getAttribute('aria-pressed')).toBe('true')
    expect(gridBtn.getAttribute('aria-pressed')).toBe('false')

    // Switch to grid
    fireEvent.click(gridBtn)
    expect(listBtn.getAttribute('aria-pressed')).toBe('false')
    expect(gridBtn.getAttribute('aria-pressed')).toBe('true')
  })

  it('shows loading skeleton when loading is true', async () => {
    render(<EventList events={[]} loading={true} />)
    expect(screen.getByText(/Loading events.../i)).toBeTruthy()
    // Skeleton cells should be present (using animate-pulse class on elements)
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('shows empty state when there are no events and not loading', () => {
    render(<EventList events={[]} loading={false} />)
    expect(screen.getByText(/No events found/i)).toBeTruthy()
  })
})
