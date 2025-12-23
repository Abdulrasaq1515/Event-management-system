import React from 'react'
import { cn } from '@/lib/utils/cn'

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  subtle?: boolean
}

export const Card: React.FC<CardProps> = ({ children, className, subtle = false, ...rest }) => {
  return (
    <div
      className={cn(
        'rounded-lg p-4 bg-slate-900 text-slate-100 shadow-sm',
        subtle ? 'bg-slate-800/60' : 'bg-slate-900',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export default Card
