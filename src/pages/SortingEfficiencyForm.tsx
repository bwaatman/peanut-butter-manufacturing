import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBatchById } from '../services/batches'
import { getSortingEfficiencyByBatchId, createSortingEfficiency, updateSortingEfficiency } from '../services/sortingEfficiency'
import type { Batch, SortingEfficiencyForm } from '../types/database'
import { Button } from '../components/ui/Button'
import { LoadingState } from '../components/ui/LoadingState'
import { Alert } from '../components/ui/Alert'

export default function SortingEfficiencyForm() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [form, setForm] = useState<SortingEfficiencyForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    form_date: new Date().toISOString().split('T')[0],
    moisture_percent: '',
    total_aflatoxin_ppb: '',
    check_time: '',
    rotten_nuts_percent: '',
    shriveled_nuts_percent: '',
    over_roast_nuts_percent: '',
    non_branched_nuts_percent: '',
    overall_sorting_efficiency: '',
    result: '' as 'pass' | 'fail' | '',
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

    const [batchResult, formResult] = await Promise.all([
      getBatchById(batchId),
      getSortingEfficiencyByBatchId(batchId),
    ])

    if (batchResult.data) {
      setBatch(batchResult.data)
    }

    if (formResult.data) {
      setForm(formResult.data)
      setFormData({
        form_date: formResult.data.form_date || new Date().toISOString().split('T')[0],
        moisture_percent: formResult.data.moisture_percent?.toString() || '',
        total_aflatoxin_ppb: formResult.data.total_aflatoxin_ppb?.toString() || '',
        check_time: formResult.data.check_time || '',
        rotten_nuts_percent: formResult.data.rotten_nuts_percent?.toString() || '',
        shriveled_nuts_percent: formResult.data.shriveled_nuts_percent?.toString() || '',
        over_roast_nuts_percent: formResult.data.over_roast_nuts_percent?.toString() || '',
        non_branched_nuts_percent: formResult.data.non_branched_nuts_percent?.toString() || '',
        overall_sorting_efficiency: formResult.data.overall_sorting_efficiency?.toString() || '',
        result: formResult.data.result || '',
        remarks: formResult.data.remarks || '',
        analyst_name: formResult.data.analyst_name || '',
        analyst_signature: formResult.data.analyst_signature || '',
        signed_date: formResult.data.signed_date || new Date().toISOString().split('T')[0],
        created_by: formResult.data.created_by || '',
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
      form_date: formData.form_date || null,
      moisture_percent: formData.moisture_percent ? parseFloat(formData.moisture_percent) : null,
      total_aflatoxin_ppb: formData.total_aflatoxin_ppb ? parseFloat(formData.total_aflatoxin_ppb) : null,
      check_time: formData.check_time || null,
      rotten_nuts_percent: formData.rotten_nuts_percent ? parseFloat(formData.rotten_nuts_percent) : null,
      shriveled_nuts_percent: formData.shriveled_nuts_percent ? parseFloat(formData.shriveled_nuts_percent) : null,
      over_roast_nuts_percent: formData.over_roast_nuts_percent ? parseFloat(formData.over_roast_nuts_percent) : null,
      non_branched_nuts_percent: formData.non_branched_nuts_percent ? parseFloat(formData.non_branched_nuts_percent) : null,
      overall_sorting_efficiency: formData.overall_sorting_efficiency ? parseFloat(formData.overall_sorting_efficiency) : null,
      result: formData.result || null,
      remarks: formData.remarks || null,
      analyst_name: formData.analyst_name || null,
      analyst_signature: formData.analyst_signature || null,
      signed_date: formData.signed_date || null,
      created_by: formData.created_by || null,
    }

    const { error } = form
      ? await updateSortingEfficiency(form.id, data)
      : await createSortingEfficiency(data)

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
    <div className="max-w-5xl mx-auto">
      {/* Paper-style Form */}
      <div className="bg-white border-2 border-gray-300 shadow-lg">
        <form onSubmit={handleSubmit} className="p-6">
          {/* SECTION 1: DOCUMENT HEADER */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-400">
            <div className="flex space-x-8">
              <div className="flex items-center">
                <label className="text-sm font-semibold text-gray-700 mr-2">Doc No:</label>
                <input
                  type="text"
                  value="QC-SE-001"
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

          {/* SECTION 3: TOP SUMMARY QC SECTION */}
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Moisture (%)</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Total Aflatoxin (ppb)</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Overall Sorting Efficiency (%)</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Result (Pass/Fail)</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    <input
                      type="text"
                      value={formData.moisture_percent}
                      onChange={(e) => setFormData({ ...formData, moisture_percent: e.target.value })}
                      className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="0.00"
                    />
                    <div className="text-xs text-gray-500 mt-1">Standard: ≤5</div>
                  </td>
                  <td className="border border-gray-400 px-3 py-2">
                    <input
                      type="text"
                      value={formData.total_aflatoxin_ppb}
                      onChange={(e) => setFormData({ ...formData, total_aflatoxin_ppb: e.target.value })}
                      className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="0.00"
                    />
                    <div className="text-xs text-gray-500 mt-1">Standard: ≤10</div>
                  </td>
                  <td className="border border-gray-400 px-3 py-2">
                    <input
                      type="text"
                      value={formData.overall_sorting_efficiency}
                      onChange={(e) => setFormData({ ...formData, overall_sorting_efficiency: e.target.value })}
                      className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="border border-gray-400 px-3 py-2">
                    <select
                      value={formData.result}
                      onChange={(e) => setFormData({ ...formData, result: e.target.value as 'pass' | 'fail' | '' })}
                      className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="">Select</option>
                      <option value="pass">Pass</option>
                      <option value="fail">Fail</option>
                    </select>
                  </td>
                  <td className="border border-gray-400 px-3 py-2">
                    <textarea
                      rows={2}
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500 resize-none"
                      placeholder="Enter remarks..."
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 4: MAIN MONITORING TABLE */}
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Time</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Rotten Nuts (0%)</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">(Woola)</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Shriverred Nuts (0%)</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">(Mphwephwa)</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Over roast Nuts (≤1%)</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">(Wopselera)</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Non branched Nuts (0%)</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">(Wosasupuka)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
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
                      type="text"
                      value={formData.rotten_nuts_percent}
                      onChange={(e) => setFormData({ ...formData, rotten_nuts_percent: e.target.value })}
                      className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-gray-500 italic">Woola</td>
                  <td className="border border-gray-400 px-3 py-2">
                    <input
                      type="text"
                      value={formData.shriveled_nuts_percent}
                      onChange={(e) => setFormData({ ...formData, shriveled_nuts_percent: e.target.value })}
                      className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-gray-500 italic">Mphwephwa</td>
                  <td className="border border-gray-400 px-3 py-2">
                    <input
                      type="text"
                      value={formData.over_roast_nuts_percent}
                      onChange={(e) => setFormData({ ...formData, over_roast_nuts_percent: e.target.value })}
                      className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-gray-500 italic">Wopselera</td>
                  <td className="border border-gray-400 px-3 py-2">
                    <input
                      type="text"
                      value={formData.non_branched_nuts_percent}
                      onChange={(e) => setFormData({ ...formData, non_branched_nuts_percent: e.target.value })}
                      className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-gray-500 italic">Wosasupuka</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 5: ANALYST SECTION */}
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

          {/* SECTION 6: FOOTER APPROVAL TABLE */}
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 mt-6 border-t-2 border-gray-400">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/traceability/${batchId}`)}
              className="border-2 border-gray-400 px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 border-2 border-blue-600"
            >
              {saving ? 'Saving...' : form ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
