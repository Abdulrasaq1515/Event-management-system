import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'

type Props = {
  onEdit?: () => void
  onAttach?: () => void
  onDelete?: () => void
}

export const EventActions: React.FC<Props> = ({ onEdit, onAttach, onDelete }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <Button variant="ghost" aria-label="actions" onClick={() => setOpen((s) => !s)}>•••</Button>
      {open ? (
        <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-md shadow-md z-20">
          <button className="w-full text-left px-3 py-2 hover:bg-slate-700" onClick={() => { setOpen(false); onEdit?.() }}>Edit</button>
          <button className="w-full text-left px-3 py-2 hover:bg-slate-700" onClick={() => { setOpen(false); onAttach?.() }}>Attach NFT</button>
          <button className="w-full text-left px-3 py-2 text-red-400 hover:bg-slate-700" onClick={() => { setOpen(false); onDelete?.() }}>Delete</button>
        </div>
      ) : null}
    </div>
  )
}

export default EventActions
