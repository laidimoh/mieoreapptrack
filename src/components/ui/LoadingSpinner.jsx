import React from 'react'
import { cn } from '@/lib/utils.js'

const LoadingSpinner = ({ size = 'default', className, ...props }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <div className="flex items-center justify-center p-4" {...props}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-muted border-t-primary',
          sizeClasses[size],
          className
        )}
      />
    </div>
  )
}

export default LoadingSpinner
