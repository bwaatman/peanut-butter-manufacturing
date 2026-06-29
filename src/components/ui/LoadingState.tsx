export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export function LoadingInline() {
  return (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-700"></div>
  )
}
