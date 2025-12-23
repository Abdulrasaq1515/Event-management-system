"use client"
import React from 'react'
import { Card } from './Card'
import { Button } from './Button'

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  title?: string
  message?: string
  showDetails?: boolean
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again.",
  showDetails = false
}) => {
  return (
    <Card className="p-6 text-center max-w-md mx-auto">
      <div className="mb-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/20 flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-red-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-red-400 mb-2">
          {title}
        </h2>
        
        <p className="text-slate-400 mb-4">
          {message}
        </p>
      </div>

      {/* Error details */}
      {showDetails && error && (
        <div className="mb-4 p-3 bg-slate-800 rounded-md text-left">
          <div className="text-sm font-medium text-red-400 mb-2">
            Error Details:
          </div>
          <div className="text-xs text-slate-300 font-mono break-all">
            {error.message}
          </div>
        </div>
      )}

      {resetError && (
        <Button variant="primary" onClick={resetError}>
          Try Again
        </Button>
      )}
    </Card>
  )
}

export default ErrorFallback