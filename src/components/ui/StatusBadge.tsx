import { ReactNode } from 'react'

interface StatusBadgeProps {
  status: string
  children?: ReactNode
}

const statusStyles: Record<string, string> = {
  received: 'bg-blue-100 text-blue-800 border-blue-200',
  sorting: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  roasting: 'bg-orange-100 text-orange-800 border-orange-200',
  finished: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-primary-100 text-primary-800 border-primary-200',
  pending: 'bg-gray-100 text-gray-800 border-gray-200',
  pass: 'bg-green-100 text-green-800 border-green-200',
  fail: 'bg-red-100 text-red-800 border-red-200',
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const style = statusStyles[status.toLowerCase()] || statusStyles.pending
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {children || status}
    </span>
  )
}
