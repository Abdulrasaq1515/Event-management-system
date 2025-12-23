import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders children and responds to click', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click me</Button>)
    const btn = screen.getByRole('button', { name: /click me/i })
    expect(btn).toBeTruthy()
    fireEvent.click(btn)
    expect(onClick).toHaveBeenCalled()
  })

  it('applies variant and size classes', () => {
    render(<Button variant="ghost" size="lg">Ghost</Button>)
    const btn = screen.getByRole('button', { name: /ghost/i })
    expect(btn.className).toContain('bg-transparent')
    expect(btn.className).toContain('px-6')
  })
})
