import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBatchById } from '../services/batches'
import { getFinishedGoodsByBatchId, createFinishedGoods, updateFinishedGoods } from '../services/finishedGoods'
import type { Batch, FinishedGoods } from '../types/database'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { LoadingState } from '../components/ui/LoadingState'
import { Alert } from '../components/ui/Alert'

export default function FinishedGoodsForm() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [goods, setGoods] = useState<FinishedGoods | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    finished_date: new Date().toISOString().split('T')[0],
    quantity_produced_kg: '',
    qc_result: '',
    remarks: '',
    approved_by: '',
  })

  useEffect(() => {
    loadData()
  }, [batchId])

  const loadData = async () => {
    if (!batchId) return

    const [batchResult, goodsResult] = await Promise.all([
      getBatchById(batchId),
      getFinishedGoodsByBatchId(batchId),
    ])

    if (batchResult.data) {
      setBatch(batchResult.data)
    }

    if (goodsResult.data) {
      setGoods(goodsResult.data)
      setFormData({
        finished_date: goodsResult.data.finished_date || new Date().toISOString().split('T')[0],
        quantity_produced_kg: goodsResult.data.quantity_produced_kg?.toString() || '',
        qc_result: goodsResult.data.qc_result || '',
        remarks: goodsResult.data.remarks || '',
        approved_by: goodsResult.data.approved_by || '',
      })
    }

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!batchId) return

    setSaving(true)

    const data = {
      batch_id: batchId,
      finished_date: formData.finished_date || null,
      quantity_produced_kg: formData.quantity_produced_kg ? parseFloat(formData.quantity_produced_kg) : null,
      qc_result: formData.qc_result || null,
      remarks: formData.remarks || null,
      approved_by: formData.approved_by || null,
    }

    const { error } = goods
      ? await updateFinishedGoods(goods.id, data)
      : await createFinishedGoods(data)

    if (!error) {
      navigate(`/traceability/${batchId}`)
    }

    setSaving(false)
  }

  if (loading) {
    return <LoadingState />
  }

  if (!batch) {
    return (
      <Alert type="error">
        Batch not found
      </Alert>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Finished Goods Form</h1>
        <p className="mt-1 text-sm text-gray-500">Batch: {batch.batch_no}</p>
      </div>

      {/* Professional Clean Form */}
      <Card className="border-2">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section Header */}
            <div className="border-b-2 border-gray-300 pb-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Finished Goods Information</h2>
              <p className="text-sm text-gray-500 mt-1">Record final product details and quality control results</p>
            </div>

            {/* Batch Information */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Batch Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Batch Number:</span>
                  <span className="ml-2 font-medium text-gray-900">{batch.batch_no}</span>
                </div>
                <div>
                  <span className="text-gray-500">Product:</span>
                  <span className="ml-2 font-medium text-gray-900">{batch.product_name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Production Date:</span>
                  <span className="ml-2 font-medium text-gray-900">{batch.production_date}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2 font-medium text-gray-900 capitalize">{batch.process_status}</span>
                </div>
              </div>
            </div>

            {/* Finished Goods Details */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-700">Product Details</h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Input
                  label="Finished Date"
                  type="date"
                  value={formData.finished_date}
                  onChange={(e) => setFormData({ ...formData, finished_date: e.target.value })}
                />

                <Input
                  label="Quantity Produced (kg)"
                  type="number"
                  step="0.01"
                  value={formData.quantity_produced_kg}
                  onChange={(e) => setFormData({ ...formData, quantity_produced_kg: e.target.value })}
                  placeholder="0.00"
                />

                <Select
                  label="QC Result"
                  value={formData.qc_result}
                  onChange={(e) => setFormData({ ...formData, qc_result: e.target.value })}
                  options={[
                    { value: '', label: 'Select QC result' },
                    { value: 'pass', label: 'Pass' },
                    { value: 'fail', label: 'Fail' },
                    { value: 'pending', label: 'Pending' },
                  ]}
                />

                <Input
                  label="Approved By"
                  value={formData.approved_by}
                  onChange={(e) => setFormData({ ...formData, approved_by: e.target.value })}
                  placeholder="Approver name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Enter any additional notes or observations..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/traceability/${batchId}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : goods ? 'Update Record' : 'Save Record'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
