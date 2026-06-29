import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getBatchById } from '../services/batches'
import { getRoastingTemperaturesByBatchId, createRoastingTemperature } from '../services/roastingTemperature'
import type { Batch, RoastingTemperatureForm } from '../types/database'
import { Button } from '../components/ui/Button'
import { LoadingState } from '../components/ui/LoadingState'
import { Alert } from '../components/ui/Alert'

export default function RoastingTemperatureForm() {
  const { batchId } = useParams<{ batchId: string }>()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [logs, setLogs] = useState<RoastingTemperatureForm[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    form_date: new Date().toISOString().split('T')[0],
    check_time: '',
    temperature: '',
    within_limit: false,
    remarks: '',
    analyst_name: '',
    analyst_signature: '',
    signed_date: new Date().toISOString().split('T')[0],
    created_by: '',
  })

  useEffect(() => {
    loadData()
  }, [batchId])

  const loadData = async () => {
    if (!batchId) return

    const [batchResult, logsResult] = await Promise.all([
      getBatchById(batchId),
      getRoastingTemperaturesByBatchId(batchId),
    ])

    if (batchResult.data) {
      setBatch(batchResult.data)
    }

    if (logsResult.data) {
      setLogs(logsResult.data)
    }

    setLoading(false)
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

  const isTemperatureWarning = (temp: number) => temp < 137 || temp > 230

  const handleAddRow = async () => {
    if (!batchId) return

    setSaving(true)

    const data = {
      batch_id: batchId,
      form_date: formData.form_date || null,
      check_time: formData.check_time || null,
      temperature: formData.temperature ? parseFloat(formData.temperature) : null,
      within_limit: formData.within_limit,
      remarks: formData.remarks || null,
      analyst_name: formData.analyst_name || null,
      analyst_signature: formData.analyst_signature || null,
      signed_date: formData.signed_date || null,
      created_by: formData.created_by || null,
    }

    const { error } = await createRoastingTemperature(data)

    if (!error) {
      setFormData({
        form_date: new Date().toISOString().split('T')[0],
        check_time: '',
        temperature: '',
        within_limit: false,
        remarks: '',
        analyst_name: '',
        analyst_signature: '',
        signed_date: new Date().toISOString().split('T')[0],
        created_by: '',
      })
      await loadData()
    }

    setSaving(false)
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Paper-style Form */}
      <div className="bg-white border-2 border-gray-300 shadow-lg">
        <div className="p-6">
          {/* SECTION 1: DOCUMENT HEADER */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-400">
            <div className="flex space-x-8">
              <div className="flex items-center">
                <label className="text-sm font-semibold text-gray-700 mr-2">Doc No:</label>
                <input
                  type="text"
                  value="QC-RT-001"
                  readOnly
                  className="border-b border-gray-400 px-2 py-1 text-sm w-32 bg-gray-50 focus:outline-none"
                />
              </div>
              <div className="flex items-center">
                <label className="text-sm font-semibold text-gray-700 mr-2">Rev No:</label>
                <input
                  type="text"
                  value="00"
                  readOnly
                  className="border-b border-gray-400 px-2 py-1 text-sm w-16 bg-gray-50 focus:outline-none"
                />
              </div>
              <div className="flex items-center">
                <label className="text-sm font-semibold text-gray-700 mr-2">Effective Date:</label>
                <input
                  type="text"
                  value="SEPT 2025"
                  readOnly
                  className="border-b border-gray-400 px-2 py-1 text-sm w-24 bg-gray-50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: BATCH DETAILS */}
          <div className="flex space-x-8 mb-6">
            <div className="flex items-center">
              <label className="text-sm font-semibold text-gray-700 mr-2">Date:</label>
              <input
                type="date"
                value={formData.form_date}
                onChange={(e) => setFormData({ ...formData, form_date: e.target.value })}
                className="border-b border-gray-400 px-2 py-1 text-sm w-40 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center">
              <label className="text-sm font-semibold text-gray-700 mr-2">Batch Number:</label>
              <input
                type="text"
                value={batch.batch_no}
                readOnly
                className="border-b border-gray-400 px-2 py-1 text-sm w-48 bg-gray-50 focus:outline-none"
              />
            </div>
          </div>

          {/* SECTION 3: MAIN ROASTING MONITORING TABLE */}
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Time</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Temperature (°C)</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Temperature Limit / Standard</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Within Limit</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {/* Existing logs */}
                {logs.map((log, index) => (
                  <tr key={log.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-400 px-3 py-2 text-sm">{log.check_time}</td>
                    <td className="border border-gray-400 px-3 py-2 text-sm">
                      <div className="flex items-center">
                        {log.temperature}°C
                        {log.temperature && isTemperatureWarning(log.temperature) && (
                          <span className="ml-2 text-xs text-red-600 font-semibold">⚠</span>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-xs text-gray-500">137°C - 230°C</td>
                    <td className="border border-gray-400 px-3 py-2 text-sm">
                      {log.within_limit ? (
                        <span className="text-green-700 font-semibold">Yes</span>
                      ) : (
                        <span className="text-red-700 font-semibold">No</span>
                      )}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-sm">{log.remarks || '-'}</td>
                  </tr>
                ))}
                {/* Add new row */}
                <tr className="bg-yellow-50">
                  <td className="border border-gray-400 px-3 py-2">
                    <input
                      type="time"
                      value={formData.check_time}
                      onChange={(e) => setFormData({ ...formData, check_time: e.target.value })}
                      className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </td>
                  <td className="border border-gray-400 px-3 py-2">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => {
                        const temp = parseFloat(e.target.value)
                        setFormData({
                          ...formData,
                          temperature: e.target.value,
                          within_limit: temp >= 137 && temp <= 230,
                        })
                      }}
                      className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="137-230"
                    />
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-gray-500">137°C - 230°C</td>
                  <td className="border border-gray-400 px-3 py-2">
                    <select
                      value={formData.within_limit ? 'yes' : 'no'}
                      onChange={(e) => setFormData({ ...formData, within_limit: e.target.value === 'yes' })}
                      className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </td>
                  <td className="border border-gray-400 px-3 py-2">
                    <input
                      type="text"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="Enter remarks"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-2 text-right">
              <Button
                type="button"
                onClick={handleAddRow}
                disabled={saving || !formData.check_time || !formData.temperature}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-sm border-2 border-blue-600"
              >
                {saving ? 'Adding...' : 'Add Temperature Reading'}
              </Button>
            </div>
          </div>

          {/* SECTION 4: ANALYST SIGNOFF */}
          <div className="mb-6 pt-4 border-t-2 border-gray-400">
            <div className="flex space-x-8">
              <div className="flex items-center">
                <label className="text-sm font-semibold text-gray-700 mr-2">Analyst Name:</label>
                <input
                  type="text"
                  value={formData.analyst_name}
                  onChange={(e) => setFormData({ ...formData, analyst_name: e.target.value })}
                  className="border-b border-gray-400 px-2 py-1 text-sm w-64 focus:outline-none focus:border-blue-500"
                  placeholder="Enter analyst name"
                />
              </div>
              <div className="flex items-center">
                <label className="text-sm font-semibold text-gray-700 mr-2">Signature:</label>
                <input
                  type="text"
                  value={formData.analyst_signature}
                  onChange={(e) => setFormData({ ...formData, analyst_signature: e.target.value })}
                  className="border-b border-gray-400 px-2 py-1 text-sm w-64 focus:outline-none focus:border-blue-500"
                  placeholder="Digital signature"
                />
              </div>
              <div className="flex items-center">
                <label className="text-sm font-semibold text-gray-700 mr-2">Date:</label>
                <input
                  type="date"
                  value={formData.signed_date}
                  onChange={(e) => setFormData({ ...formData, signed_date: e.target.value })}
                  className="border-b border-gray-400 px-2 py-1 text-sm w-40 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: FOOTER APPROVAL TABLE */}
          <div className="pt-4 border-t-2 border-gray-400">
            <table className="w-full border-collapse border border-gray-400">
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 text-xs font-semibold w-1/3">Author/Date:</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs">PM</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs font-semibold w-1/3">Approved By/Date:</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs">SHEQ Manager</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 text-xs"></td>
                  <td className="border border-gray-400 px-3 py-2 text-xs"></td>
                  <td className="border border-gray-400 px-3 py-2 text-xs"></td>
                  <td className="border border-gray-400 px-3 py-2 text-xs">CEO</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
