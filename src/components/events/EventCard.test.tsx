import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

// Mock next/navigation useRouter before importing the component so we can assert navigation
const pushMock = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }))

import { EventCard } from './EventCard'

describe('EventCard', () => {
  it('renders title and fields', () => {
    render(<table><tbody><EventCard id="1" title="Test Event" date="2025-01-01" location="Venue" ticketsSold={100} status="Upcoming" /></tbody></table>)
    expect(screen.getByText(/Test Event/i)).toBeTruthy()
    expect(screen.getByText(/Venue/i)).toBeTruthy()
    expect(screen.getByText(/100/)).toBeTruthy()
    expect(screen.getByText(/Upcoming/i)).toBeTruthy()
    // Link to detail page exists
    const link = screen.getByRole('link', { name: /Test Event/i }) as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/events/1')
  })

  it('shows actions menu when clicked', async () => {
    render(<table><tbody><EventCard id="1" title="Test Event" date="2025-01-01" location="Venue" ticketsSold={100} status="Upcoming" /></tbody></table>)
    const btn = screen.getByRole('button', { name: /actions/i })
    expect(btn).toBeTruthy()
    // Click to open menu
    fireEvent.click(btn)
    expect(await screen.findByText(/Edit/)).toBeTruthy()
    expect(await screen.findByText(/Attach NFT/)).toBeTruthy()
    expect(await screen.findByText(/Delete/)).toBeTruthy()
  })

  it('opens actions menu on keyboard activation (Enter)', async () => {
    render(<table><tbody><EventCard id="1" title="Test Event" date="2025-01-01" location="Venue" ticketsSold={100} status="Upcoming" /></tbody></table>)
    const btn = screen.getByRole('button', { name: /actions/i })
    expect(btn).toBeTruthy()
    // Keyboard activate (Enter) using userEvent to simulate real key press
    btn.focus()
    await userEvent.keyboard('{Enter}')
    expect(await screen.findByText(/Edit/)).toBeTruthy()
    expect(await screen.findByText(/Attach NFT/)).toBeTruthy()
    expect(await screen.findByText(/Delete/)).toBeTruthy()
  })

  it('navigates to edit page when Edit action is clicked', async () => {
    render(<table><tbody><EventCard id="1" title="Test Event" date="2025-01-01" location="Venue" ticketsSold={100} status="Upcoming" /></tbody></table>)
    const btn = screen.getByRole('button', { name: /actions/i })
    fireEvent.click(btn)
    const edit = await screen.findByText(/Edit/)
    fireEvent.click(edit)
    expect(pushMock).toHaveBeenCalledWith('/events/edit/1')
  })
})
