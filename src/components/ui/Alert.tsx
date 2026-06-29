import { ReactNode } from 'react'

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  children: ReactNode
  className?: string
}

const alertStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

export function Alert({ type = 'info', children, className = '' }: AlertProps) {
  return (
    <div className={`px-4 py-3 rounded-md border ${alertStyles[type]} ${className}`}>
      {children}
    </div>
  )
}
