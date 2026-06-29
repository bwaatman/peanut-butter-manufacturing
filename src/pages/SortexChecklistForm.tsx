import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBatchById } from '../services/batches'
import { getSortexHourlyRecords, createSortexHourlyRecord } from '../services/sortexChecklist'
import type { Batch, SortexHourlyRecord } from '../types/database'
import { LoadingState } from '../components/ui/LoadingState'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'

export default function SortexChecklistForm() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [records, setRecords] = useState<SortexHourlyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    form_date: new Date().toISOString().split('T')[0],
    check_time: '',
    moisture: '',
    foreign_matter: '',
    odor: '',
    discolored: '',
    different_variety: '',
    splits: '',
    shrivelled: '',
    live_insects: '',
    remarks: '',
    analyst_name: '',
    analyst_signature: '',
    signed_date: '',
  })

  useEffect(() => {
    if (batchId) {
      loadData()
    }
  }, [batchId])

  const loadData = async () => {
    if (!batchId) return

    setLoading(true)
    const [batchResult, recordsResult] = await Promise.all([
      getBatchById(batchId),
      getSortexHourlyRecords(batchId),
    ])

    if (batchResult.data) setBatch(batchResult.data)
    if (recordsResult.data) setRecords(recordsResult.data)

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!batchId) return

    setSaving(true)
    setError(null)

    const data = {
      batch_id: batchId,
      form_date: formData.form_date || null,
      check_time: formData.check_time || null,
      moisture: formData.moisture ? parseFloat(formData.moisture) : null,
      foreign_matter: formData.foreign_matter ? parseFloat(formData.foreign_matter) : null,
      odor: formData.odor ? parseFloat(formData.odor) : null,
      discolored: formData.discolored ? parseFloat(formData.discolored) : null,
      different_variety: formData.different_variety ? parseFloat(formData.different_variety) : null,
      splits: formData.splits ? parseFloat(formData.splits) : null,
      shrivelled: formData.shrivelled ? parseFloat(formData.shrivelled) : null,
      live_insects: formData.live_insects ? parseFloat(formData.live_insects) : null,
      remarks: formData.remarks || null,
      analyst_name: formData.analyst_name || null,
      analyst_signature: formData.analyst_signature || null,
      signed_date: formData.signed_date || null,
    }

    const { error } = await createSortexHourlyRecord(data)

    if (!error) {
      // Reset form
      setFormData({
        ...formData,
        check_time: '',
        moisture: '',
        foreign_matter: '',
        odor: '',
        discolored: '',
        different_variety: '',
        splits: '',
        shrivelled: '',
        live_insects: '',
        remarks: '',
      })
      // Reload records
      await loadData()
    } else {
      setError(error.message)
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
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-400 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 uppercase">Sortex Hourly Checklist</h1>
        <p className="text-sm text-gray-600 mt-1">
          Batch: {batch.batch_no} | {batch.product_name}
        </p>
      </div>

      {error && (
        <Alert type="error">
          {error}
        </Alert>
      )}

      {/* Form */}
      <div className="mb-6 bg-white border-2 border-gray-400 p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.form_date}
                onChange={(e) => setFormData({ ...formData, form_date: e.target.value })}
                className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Check Time</label>
              <input
                type="time"
                value={formData.check_time}
                onChange={(e) => setFormData({ ...formData, check_time: e.target.value })}
                className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div></div>
          </div>

          {/* Quality Parameters */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b-2 border-gray-400 pb-2">Quality Parameters</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Moisture (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.moisture}
                  onChange={(e) => setFormData({ ...formData, moisture: e.target.value })}
                  className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Foreign Matter (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.foreign_matter}
                  onChange={(e) => setFormData({ ...formData, foreign_matter: e.target.value })}
                  className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Odor (score)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.odor}
                  onChange={(e) => setFormData({ ...formData, odor: e.target.value })}
                  className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discolored (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.discolored}
                  onChange={(e) => setFormData({ ...formData, discolored: e.target.value })}
                  className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Different Variety (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.different_variety}
                  onChange={(e) => setFormData({ ...formData, different_variety: e.target.value })}
                  className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Splits (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.splits}
                  onChange={(e) => setFormData({ ...formData, splits: e.target.value })}
                  className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Shrivelled (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.shrivelled}
                  onChange={(e) => setFormData({ ...formData, shrivelled: e.target.value })}
                  className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Live Insects (count)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.live_insects}
                  onChange={(e) => setFormData({ ...formData, live_insects: e.target.value })}
                  className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* Signature */}
          <div className="mb-6 pt-6 border-t-2 border-gray-400">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Analyst Name</label>
                <input
                  type="text"
                  value={formData.analyst_name}
                  onChange={(e) => setFormData({ ...formData, analyst_name: e.target.value })}
                  className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Analyst Signature</label>
                <input
                  type="text"
                  value={formData.analyst_signature}
                  onChange={(e) => setFormData({ ...formData, analyst_signature: e.target.value })}
                  className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Signed Date</label>
                <input
                  type="date"
                  value={formData.signed_date}
                  onChange={(e) => setFormData({ ...formData, signed_date: e.target.value })}
                  className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-400">
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
              {saving ? 'Saving...' : 'Save Record'}
            </Button>
          </div>
        </form>
      </div>

      {/* Previous Records */}
      <div className="bg-white border-2 border-gray-400">
        <div className="bg-yellow-100 border-b-2 border-gray-400 px-4 py-2">
          <h2 className="text-sm font-semibold text-gray-900">Hourly Records ({records.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Date</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Time</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Moisture</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Foreign Matter</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Odor</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Discolored</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Diff Variety</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Splits</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Shrivelled</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Live Insects</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-400 px-3 py-2 text-xs">{record.form_date}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs">{record.check_time}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{record.moisture}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{record.foreign_matter}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{record.odor}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{record.discolored}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{record.different_variety}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{record.splits}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{record.shrivelled}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{record.live_insects}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={10} className="border border-gray-400 px-3 py-4 text-center text-sm text-gray-500">
                    No hourly records yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
