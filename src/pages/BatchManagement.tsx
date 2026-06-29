import { useEffect, useState } from 'react'
import { getBatches, createBatch, deleteBatch } from '../services/batches'
import type { Batch } from '../types/database'
import { Plus, Trash2, Eye, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table'
import { StatusBadge } from '../components/ui/StatusBadge'
import { LoadingState } from '../components/ui/LoadingState'
import { EmptyState } from '../components/ui/EmptyState'

export default function BatchManagement() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newBatch, setNewBatch] = useState({
    batch_no: '',
    production_date: new Date().toISOString().split('T')[0],
    product_name: 'Peanut Butter',
    process_status: 'received' as const,
    created_by: '',
  })

  useEffect(() => {
    loadBatches()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = batches.filter(batch =>
        batch.batch_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredBatches(filtered)
    } else {
      setFilteredBatches(batches)
    }
  }, [searchTerm, batches])

  const loadBatches = async () => {
    const { data } = await getBatches()
    if (data) {
      setBatches(data)
      setFilteredBatches(data)
    }
    setLoading(false)
  }

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Creating batch:', newBatch)
    try {
      const { data, error } = await createBatch(newBatch)
      console.log('Batch creation result:', { data, error })
      if (error) {
        console.error('Error creating batch:', error)
        alert(`Error creating batch: ${error.message}`)
        return
      }
      if (data) {
        setBatches([data, ...batches])
        setShowCreateForm(false)
        setNewBatch({
          batch_no: '',
          production_date: new Date().toISOString().split('T')[0],
          product_name: 'Peanut Butter',
          process_status: 'received',
          created_by: '',
        })
      }
    } catch (err) {
      console.error('Unexpected error creating batch:', err)
      alert('Unexpected error creating batch')
    }
  }

  const handleDeleteBatch = async (id: string) => {
    if (confirm('Are you sure you want to delete this batch?')) {
      const { error } = await deleteBatch(id)
      if (!error) {
        setBatches(batches.filter(b => b.id !== id))
      }
    }
  }

  const getContinueAction = (batch: Batch) => {
    switch (batch.process_status) {
      case 'received':
        return `/incoming-receipt/${batch.id}`
      case 'sorting':
        return `/sorting-efficiency/${batch.id}`
      case 'roasting':
        return `/roasting-temperature/${batch.id}`
      case 'finished':
        return `/finished-goods/${batch.id}`
      default:
        return `/traceability/${batch.id}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batch Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage production batches</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Batch
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Create New Batch</CardTitle>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBatch} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Input
                  label="Batch Number"
                  required
                  value={newBatch.batch_no}
                  onChange={(e) => setNewBatch({ ...newBatch, batch_no: e.target.value })}
                  placeholder="e.g., BATCH-2024-001"
                />
                <Input
                  label="Production Date"
                  type="date"
                  required
                  value={newBatch.production_date}
                  onChange={(e) => setNewBatch({ ...newBatch, production_date: e.target.value })}
                />
                <Input
                  label="Product Name"
                  value={newBatch.product_name}
                  onChange={(e) => setNewBatch({ ...newBatch, product_name: e.target.value })}
                  placeholder="e.g., Peanut Butter"
                />
                <Input
                  label="Created By"
                  value={newBatch.created_by}
                  onChange={(e) => setNewBatch({ ...newBatch, created_by: e.target.value })}
                  placeholder="Operator name"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create Batch
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Batches</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState />
          ) : filteredBatches.length === 0 ? (
            <EmptyState
              title={searchTerm ? "No batches found" : "No batches found"}
              description={searchTerm ? "Try a different search term" : "Create your first batch to get started"}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch No</TableHead>
                  <TableHead>Production Date</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Process Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.batch_no}</TableCell>
                    <TableCell>{batch.production_date}</TableCell>
                    <TableCell>{batch.product_name}</TableCell>
                    <TableCell>
                      <StatusBadge status={batch.process_status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={getContinueAction(batch)}
                          className="text-primary-700 hover:text-primary-800 text-sm font-medium"
                        >
                          Continue
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link
                          to={`/traceability/${batch.id}`}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Traceability"
                        >
                          <Eye className="w-4 h-4 inline" />
                        </Link>
                        <button
                          onClick={() => handleDeleteBatch(batch.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
