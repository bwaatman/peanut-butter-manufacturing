import { useEffect, useState } from 'react'
import { getBatches } from '../services/batches'
import type { Batch } from '../types/database'
import { Package, Clock, CheckCircle, ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table'
import { StatusBadge } from '../components/ui/StatusBadge'
import { LoadingState } from '../components/ui/LoadingState'
import { EmptyState } from '../components/ui/EmptyState'
import { Alert } from '../components/ui/Alert'

export default function Dashboard() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBatches()
  }, [])

  const loadBatches = async () => {
    console.log('Loading batches...')
    const { data, error } = await getBatches()
    console.log('Batches response:', { data, error })
    
    if (error) {
      console.error('Error loading batches:', error)
      setError(error.message)
    } else if (data) {
      setBatches(data)
    }
    setLoading(false)
  }

  const stats = {
    total: batches.length,
    inProgress: batches.filter(b => b.process_status !== 'completed').length,
    completed: batches.filter(b => b.process_status === 'completed').length,
  }

  const productionFlow = {
    received: batches.filter(b => b.process_status === 'received').length,
    sorting: batches.filter(b => b.process_status === 'sorting').length,
    roasting: batches.filter(b => b.process_status === 'roasting').length,
    finished: batches.filter(b => b.process_status === 'finished').length,
  }

  const currentStage = batches.find(b => b.process_status !== 'completed')?.process_status || 'No active batches'

  return (
    <div className="space-y-6">
      {error && (
        <Alert type="error">
          {error}
        </Alert>
      )}
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Batches</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.inProgress}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-accent-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completed}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Stage</p>
              <p className="text-xl font-bold text-gray-900 mt-2 capitalize">{currentStage}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Flow Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Production Flow Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-blue-800">{productionFlow.received}</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Incoming Receipt</p>
            </div>
            <ArrowDown className="h-6 w-6 text-gray-400 flex-shrink-0 mx-2" />
            <div className="flex-1 text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-yellow-800">{productionFlow.sorting}</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Sorting</p>
            </div>
            <ArrowDown className="h-6 w-6 text-gray-400 flex-shrink-0 mx-2" />
            <div className="flex-1 text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-orange-800">{productionFlow.roasting}</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Roasting</p>
            </div>
            <ArrowDown className="h-6 w-6 text-gray-400 flex-shrink-0 mx-2" />
            <div className="flex-1 text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-green-800">{productionFlow.finished}</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Finished Goods</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Batches Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Batches</CardTitle>
            <Link
              to="/batches"
              className="text-primary-700 hover:text-primary-800 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState />
          ) : batches.length === 0 ? (
            <EmptyState
              title="No batches found"
              description="Create your first batch to get started"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.slice(0, 5).map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.batch_no}</TableCell>
                    <TableCell>{batch.production_date}</TableCell>
                    <TableCell className="capitalize">{batch.process_status}</TableCell>
                    <TableCell>
                      <StatusBadge status={batch.process_status} />
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/traceability/${batch.id}`}
                        className="text-primary-700 hover:text-primary-800 font-medium"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
