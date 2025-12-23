import React from 'react'
import Card from './Card'

type Props = {
  title: string
  value: string | number
  delta?: string
  icon?: string
  trend?: 'up' | 'down' | 'neutral'
}

export const StatCard: React.FC<Props> = ({ 
  title, 
  value, 
  delta, 
  icon = '📊',
  trend = 'neutral' 
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-400'
      case 'down':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗'
      case 'down':
        return '↘'
      default:
        return '→'
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{icon}</span>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">
              {title}
            </div>
          </div>
          
          <div className="text-3xl font-bold text-slate-100 mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          
          {delta && (
            <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
              <span>{getTrendIcon()}</span>
              <span>{delta}</span>
            </div>
          )}
        </div>
        
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-4 translate-x-4" />
      </div>
    </Card>
  )
}

export default StatCard
