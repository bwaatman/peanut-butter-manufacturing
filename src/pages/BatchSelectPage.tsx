import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBatches } from '../services/batches'
import type { Batch } from '../types/database'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingState } from '../components/ui/LoadingState'
import { EmptyState } from '../components/ui/EmptyState'

interface BatchSelectPageProps {
  title: string
  description: string
  getTargetPath: (batchId: string) => string
}

export default function BatchSelectPage({ title, description, getTargetPath }: BatchSelectPageProps) {
  const navigate = useNavigate()
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBatches()
  }, [])

  const loadBatches = async () => {
    const { data } = await getBatches()
    if (data) {
      setBatches(data)
    }
    setLoading(false)
  }

  const handleSelectBatch = (batchId: string) => {
    navigate(getTargetPath(batchId))
  }

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      {batches.length === 0 ? (
        <EmptyState
          title="No batches found"
          description="Create a batch first to access this form"
          action={
            <Button onClick={() => navigate('/batches')}>
              Create Batch
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {batches.map((batch) => (
            <Card key={batch.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{batch.batch_no}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {batch.product_name} • {batch.production_date}
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {batch.process_status}
                      </span>
                    </div>
                  </div>
                  <Button onClick={() => handleSelectBatch(batch.id)}>
                    Select
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
