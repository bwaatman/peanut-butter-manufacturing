import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBatchById } from '../services/batches'
import { getIncomingReceiptByBatchId, createIncomingReceipt, updateIncomingReceipt } from '../services/incomingReceipts'
import type { Batch, IncomingReceipt } from '../types/database'
import { Button } from '../components/ui/Button'
import { LoadingState } from '../components/ui/LoadingState'
import { Alert } from '../components/ui/Alert'

export default function IncomingReceiptForm() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [receipt, setReceipt] = useState<IncomingReceipt | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    receipt_date: new Date().toISOString().split('T')[0],
    supplier_name: '',
    quantity_received_kg: '',
    origin: '',
    variety: '',
    vehicle_reg: '',
    received_by: '',
    // Quality Parameters
    appearance_result: '',
    colour_result: '',
    moisture_content_result: '',
    aflatoxin_result: '',
    rancidity_result: '',
    // Size Count Analysis
    foreign_matter_3040_result: '',
    split_kernels_4050_result: '',
    shrivelled_kernels_5060_result: '',
    mouldy_kernels_6070_result: '',
    live_insects_7080_result: '',
    rotten_nuts_80100_result: '',
    grade_out_percent: '',
    // Decision
    decision: '' as 'accept' | 'reject' | '',
    remarks: '',
    // Signatures
    reviewed_by_name: '',
    reviewed_by_date: '',
    approved_by_name: '',
    approved_by_date: '',
  })

  useEffect(() => {
    loadData()
  }, [batchId])

  const loadData = async () => {
    console.log('Loading data for batchId:', batchId)
    if (!batchId) {
      setError('No batch ID provided')
      setLoading(false)
      return
    }

    try {
      const [batchResult, receiptResult] = await Promise.all([
        getBatchById(batchId),
        getIncomingReceiptByBatchId(batchId),
      ])

      console.log('Batch result:', batchResult)
      console.log('Receipt result:', receiptResult)

      if (batchResult.data) {
        setBatch(batchResult.data)
      } else {
        setError('Batch not found')
      }

      if (receiptResult.data) {
        setReceipt(receiptResult.data)
        setFormData({
          receipt_date: receiptResult.data.receipt_date || new Date().toISOString().split('T')[0],
          supplier_name: receiptResult.data.supplier_name || '',
          quantity_received_kg: receiptResult.data.quantity_received_kg?.toString() || '',
          origin: receiptResult.data.origin || '',
          variety: receiptResult.data.variety || '',
          vehicle_reg: receiptResult.data.vehicle_reg || '',
          received_by: receiptResult.data.received_by || '',
          // Quality Parameters
          appearance_result: receiptResult.data.appearance_result || '',
          colour_result: receiptResult.data.colour_result || '',
          moisture_content_result: receiptResult.data.moisture_content_result || '',
          aflatoxin_result: receiptResult.data.aflatoxin_result || '',
          rancidity_result: receiptResult.data.rancidity_result || '',
          // Size Count Analysis
          foreign_matter_3040_result: receiptResult.data.foreign_matter_3040_result || '',
          split_kernels_4050_result: receiptResult.data.split_kernels_4050_result || '',
          shrivelled_kernels_5060_result: receiptResult.data.shrivelled_kernels_5060_result || '',
          mouldy_kernels_6070_result: receiptResult.data.mouldy_kernels_6070_result || '',
          live_insects_7080_result: receiptResult.data.live_insects_7080_result || '',
          rotten_nuts_80100_result: receiptResult.data.rotten_nuts_80100_result || '',
          grade_out_percent: receiptResult.data.grade_out_percent || '',
          // Decision
          decision: receiptResult.data.decision || '',
          remarks: receiptResult.data.remarks || '',
          // Signatures
          reviewed_by_name: receiptResult.data.reviewed_by_name || '',
          reviewed_by_date: receiptResult.data.reviewed_by_date || '',
          approved_by_name: receiptResult.data.approved_by_name || '',
          approved_by_date: receiptResult.data.approved_by_date || '',
        })
      }

      if (batchResult.error) {
        setError(batchResult.error.message)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data')
    }

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted', formData)
    if (!batchId) {
      console.error('No batchId')
      return
    }

    setSaving(true)

    const data = {
      batch_id: batchId,
      receipt_date: formData.receipt_date || null,
      supplier_name: formData.supplier_name || null,
      quantity_received_kg: formData.quantity_received_kg ? parseFloat(formData.quantity_received_kg) : null,
      origin: formData.origin || null,
      variety: formData.variety || null,
      vehicle_reg: formData.vehicle_reg || null,
      received_by: formData.received_by || null,
      // Quality Parameters
      appearance_result: formData.appearance_result || null,
      colour_result: formData.colour_result || null,
      moisture_content_result: formData.moisture_content_result || null,
      aflatoxin_result: formData.aflatoxin_result || null,
      rancidity_result: formData.rancidity_result || null,
      // Size Count Analysis
      foreign_matter_3040_result: formData.foreign_matter_3040_result || null,
      split_kernels_4050_result: formData.split_kernels_4050_result || null,
      shrivelled_kernels_5060_result: formData.shrivelled_kernels_5060_result || null,
      mouldy_kernels_6070_result: formData.mouldy_kernels_6070_result || null,
      live_insects_7080_result: formData.live_insects_7080_result || null,
      rotten_nuts_80100_result: formData.rotten_nuts_80100_result || null,
      grade_out_percent: formData.grade_out_percent || null,
      // Decision
      decision: formData.decision || null,
      remarks: formData.remarks || null,
      // Signatures
      reviewed_by_name: formData.reviewed_by_name || null,
      reviewed_by_date: formData.reviewed_by_date || null,
      approved_by_name: formData.approved_by_name || null,
      approved_by_date: formData.approved_by_date || null,
    }

    console.log('Sending data:', data)
    const { error } = receipt
      ? await updateIncomingReceipt(receipt.id, data)
      : await createIncomingReceipt(data)

    console.log('Save result:', error)
    if (!error) {
      navigate(`/traceability/${batchId}`)
    } else {
      console.error('Save error:', error)
      alert('Error saving: ' + error.message)
    }

    setSaving(false)
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <Alert type="error">
          {error}
        </Alert>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <Alert type="error">
          Batch not found
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Paper-style Form */}
      <div className="bg-white border-2 border-gray-300 shadow-lg">
        {/* Header */}
        <div className="border-b-2 border-gray-400 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-center text-gray-900 uppercase tracking-wide">
                QUALITY CONTROL OF
              </h1>
              <h2 className="text-2xl font-bold text-center text-gray-900 uppercase tracking-wide mt-1">
                INCOMING RAW MATERIALS
              </h2>
            </div>
            <div className="text-right text-sm">
              <div className="font-semibold">ISSUE DATE: SEPT 2025</div>
              <div className="font-semibold">REV. NO. 00</div>
              <div className="font-semibold">TAF/QC/R-0028</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Grid Layout */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Left Side */}
            <div className="space-y-4">
              <div className="flex items-center border-b border-gray-300 pb-2">
                <label className="w-32 text-sm font-semibold text-gray-700">Supplier:</label>
                <input
                  type="text"
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  className="flex-1 border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Enter supplier"
                />
              </div>
              <div className="flex items-center border-b border-gray-300 pb-2">
                <label className="w-32 text-sm font-semibold text-gray-700">Product Type:</label>
                <input
                  type="text"
                  value={batch.product_name}
                  readOnly
                  className="flex-1 border-b border-gray-300 px-2 py-1 text-sm bg-gray-50 focus:outline-none"
                />
              </div>
              <div className="flex items-center border-b border-gray-300 pb-2">
                <label className="w-32 text-sm font-semibold text-gray-700">Quantity:</label>
                <input
                  type="text"
                  value={formData.quantity_received_kg}
                  onChange={(e) => setFormData({ ...formData, quantity_received_kg: e.target.value })}
                  className="flex-1 border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Enter quantity"
                />
              </div>
              <div className="flex items-center border-b border-gray-300 pb-2">
                <label className="w-32 text-sm font-semibold text-gray-700">Received:</label>
                <input
                  type="text"
                  value={formData.receipt_date}
                  readOnly
                  className="flex-1 border-b border-gray-300 px-2 py-1 text-sm bg-gray-50 focus:outline-none"
                />
              </div>
              <div className="flex items-center border-b border-gray-300 pb-2">
                <label className="w-32 text-sm font-semibold text-gray-700">Lot No:</label>
                <input
                  type="text"
                  value={batch.batch_no}
                  readOnly
                  className="flex-1 border-b border-gray-300 px-2 py-1 text-sm bg-gray-50 focus:outline-none"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="space-y-4">
              <div className="flex items-center border-b border-gray-300 pb-2">
                <label className="w-32 text-sm font-semibold text-gray-700">Origin:</label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="flex-1 border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Enter origin"
                />
              </div>
              <div className="flex items-center border-b border-gray-300 pb-2">
                <label className="w-32 text-sm font-semibold text-gray-700">Variety:</label>
                <input
                  type="text"
                  value={formData.variety}
                  onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                  className="flex-1 border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Enter variety"
                />
              </div>
              <div className="flex items-center border-b border-gray-300 pb-2">
                <label className="w-32 text-sm font-semibold text-gray-700">Date Received:</label>
                <input
                  type="date"
                  value={formData.receipt_date}
                  onChange={(e) => setFormData({ ...formData, receipt_date: e.target.value })}
                  className="flex-1 border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center border-b border-gray-300 pb-2">
                <label className="w-32 text-sm font-semibold text-gray-700">Vehicle Reg:</label>
                <input
                  type="text"
                  value={formData.vehicle_reg}
                  onChange={(e) => setFormData({ ...formData, vehicle_reg: e.target.value })}
                  className="flex-1 border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Enter vehicle reg"
                />
              </div>
            </div>
          </div>

          {/* Inspection Done By */}
          <div className="flex items-center border-b border-gray-300 pb-2 mb-6">
            <label className="w-40 text-sm font-semibold text-gray-700">Inspection Done By:</label>
            <input
              type="text"
              value={formData.received_by}
              onChange={(e) => setFormData({ ...formData, received_by: e.target.value })}
              className="flex-1 border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Enter inspector name"
            />
          </div>

          {/* First Inspection Table */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b-2 border-gray-400 pb-1">QUALITY PARAMETERS</h3>
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">Parameter</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">Specification</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 text-sm">Appearance</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">Good</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">
                    <input 
                      type="text" 
                      value={formData.appearance_result}
                      onChange={(e) => setFormData({ ...formData, appearance_result: e.target.value })}
                      className="w-full border-b border-gray-300 px-1 py-1 text-sm focus:outline-none focus:border-blue-500" 
                      placeholder="Enter result" 
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 text-sm">Colour</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">Good</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">
                    <input 
                      type="text" 
                      value={formData.colour_result}
                      onChange={(e) => setFormData({ ...formData, colour_result: e.target.value })}
                      className="w-full border-b border-gray-300 px-1 py-1 text-sm focus:outline-none focus:border-blue-500" 
                      placeholder="Enter result" 
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 text-sm">Moisture Content</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">&lt;9%</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">
                    <input 
                      type="text" 
                      value={formData.moisture_content_result}
                      onChange={(e) => setFormData({ ...formData, moisture_content_result: e.target.value })}
                      className="w-full border-b border-gray-300 px-1 py-1 text-sm focus:outline-none focus:border-blue-500" 
                      placeholder="Enter result" 
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 text-sm">Aflatoxin</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">&lt;15ppb</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">
                    <input 
                      type="text" 
                      value={formData.aflatoxin_result}
                      onChange={(e) => setFormData({ ...formData, aflatoxin_result: e.target.value })}
                      className="w-full border-b border-gray-300 px-1 py-1 text-sm focus:outline-none focus:border-blue-500" 
                      placeholder="Enter result" 
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 text-sm">Rancidity (Peroxide Value)</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">0</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">
                    <input 
                      type="text" 
                      value={formData.rancidity_result}
                      onChange={(e) => setFormData({ ...formData, rancidity_result: e.target.value })}
                      className="w-full border-b border-gray-300 px-1 py-1 text-sm focus:outline-none focus:border-blue-500" 
                      placeholder="Enter result" 
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Second Inspection Table */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b-2 border-gray-400 pb-1">SIZE COUNT ANALYSIS</h3>
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">Size Count</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">Material</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">Specification</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 text-sm">30/40</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">Foreign Matter</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">1%</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">
                    <input 
                      type="text" 
                      value={formData.foreign_matter_3040_result}
                      onChange={(e) => setFormData({ ...formData, foreign_matter_3040_result: e.target.value })}
                      className="w-full border-b border-gray-300 px-1 py-1 text-sm focus:outline-none focus:border-blue-500" 
                      placeholder="Enter result" 
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 text-sm">40/50</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">Split Kernels</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">7%</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">
                    <input 
                      type="text" 
                      value={formData.split_kernels_4050_result}
                      onChange={(e) => setFormData({ ...formData, split_kernels_4050_result: e.target.value })}
                      className="w-full border-b border-gray-300 px-1 py-1 text-sm focus:outline-none focus:border-blue-500" 
                      placeholder="Enter result" 
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 text-sm">50/60</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">Shrivelled Kernels</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">3%</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">
                    <input 
                      type="text" 
                      value={formData.shrivelled_kernels_5060_result}
                      onChange={(e) => setFormData({ ...formData, shrivelled_kernels_5060_result: e.target.value })}
                      className="w-full border-b border-gray-300 px-1 py-1 text-sm focus:outline-none focus:border-blue-500" 
                      placeholder="Enter result" 
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 text-sm">60/70</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">Mouldy Kernels</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">00%</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">
                    <input 
                      type="text" 
                      value={formData.mouldy_kernels_6070_result}
                      onChange={(e) => setFormData({ ...formData, mouldy_kernels_6070_result: e.target.value })}
                      className="w-full border-b border-gray-300 px-1 py-1 text-sm focus:outline-none focus:border-blue-500" 
                      placeholder="Enter result" 
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 text-sm">70/80</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">Live Insects</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">Nil</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">
                    <input 
                      type="text" 
                      value={formData.live_insects_7080_result}
                      onChange={(e) => setFormData({ ...formData, live_insects_7080_result: e.target.value })}
                      className="w-full border-b border-gray-300 px-1 py-1 text-sm focus:outline-none focus:border-blue-500" 
                      placeholder="Enter result" 
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 text-sm">80/100</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">Rotten Nuts</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">0.5%</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">
                    <input 
                      type="text" 
                      value={formData.rotten_nuts_80100_result}
                      onChange={(e) => setFormData({ ...formData, rotten_nuts_80100_result: e.target.value })}
                      className="w-full border-b border-gray-300 px-1 py-1 text-sm focus:outline-none focus:border-blue-500" 
                      placeholder="Enter result" 
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 text-sm font-semibold">Grade Out %</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">-</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">≤10</td>
                  <td className="border border-gray-400 px-3 py-2 text-sm">
                    <input 
                      type="text" 
                      value={formData.grade_out_percent}
                      onChange={(e) => setFormData({ ...formData, grade_out_percent: e.target.value })}
                      className="w-full border-b border-gray-300 px-1 py-1 text-sm focus:outline-none focus:border-blue-500" 
                      placeholder="Enter result" 
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Decision Section */}
          <div className="mb-6 p-4 border-2 border-gray-400 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">DECISION</h3>
            <div className="flex space-x-8">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="decision" 
                  value="accept" 
                  checked={formData.decision === 'accept'}
                  onChange={(e) => setFormData({ ...formData, decision: e.target.value as 'accept' | 'reject' })}
                  className="w-5 h-5" 
                />
                <span className="text-lg font-semibold">Accept</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="decision" 
                  value="reject" 
                  checked={formData.decision === 'reject'}
                  onChange={(e) => setFormData({ ...formData, decision: e.target.value as 'accept' | 'reject' })}
                  className="w-5 h-5" 
                />
                <span className="text-lg font-semibold">Reject</span>
              </label>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b-2 border-gray-400 pb-1">REMARKS</h3>
            <textarea
              rows={6}
              className="w-full border-2 border-gray-400 p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Enter detailed remarks and observations..."
            />
          </div>

          {/* Signature Section */}
          <div className="grid grid-cols-2 gap-8 mb-6 pt-6 border-t-2 border-gray-400">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reviewed by (SHEQ Manager)</label>
              <div className="h-16 border-2 border-gray-400 mb-2"></div>
              <input
                type="text"
                value={formData.reviewed_by_name}
                onChange={(e) => setFormData({ ...formData, reviewed_by_name: e.target.value })}
                className="w-full border-2 border-gray-400 px-2 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                placeholder="Name"
              />
              <input
                type="date"
                value={formData.reviewed_by_date}
                onChange={(e) => setFormData({ ...formData, reviewed_by_date: e.target.value })}
                className="w-full border-2 border-gray-400 px-2 py-2 text-sm mt-2 focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Approved by (CEO/FM)</label>
              <div className="h-16 border-2 border-gray-400 mb-2"></div>
              <input
                type="text"
                value={formData.approved_by_name}
                onChange={(e) => setFormData({ ...formData, approved_by_name: e.target.value })}
                className="w-full border-2 border-gray-400 px-2 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                placeholder="Name"
              />
              <input
                type="date"
                value={formData.approved_by_date}
                onChange={(e) => setFormData({ ...formData, approved_by_date: e.target.value })}
                className="w-full border-2 border-gray-400 px-2 py-2 text-sm mt-2 focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-400">
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
              {saving ? 'Saving...' : receipt ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
