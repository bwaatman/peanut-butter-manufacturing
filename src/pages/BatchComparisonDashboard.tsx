import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getBatchComparisonData, getAllBatchesForComparison } from '../services/qualityMonitoring'
import type { BatchComparisonData } from '../types/database'
import { LoadingState } from '../components/ui/LoadingState'

export default function BatchComparisonDashboard() {
  const [allBatches, setAllBatches] = useState<any[]>([])
  const [selectedBatches, setSelectedBatches] = useState<string[]>([])
  const [comparisonData, setComparisonData] = useState<BatchComparisonData[]>([])
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedParameter, setSelectedParameter] = useState('moisture_content')
  const [loading, setLoading] = useState(true)
  const [comparisonMode, setComparisonMode] = useState<'all' | 'selected'>('all')

  useEffect(() => {
    loadBatches()
  }, [])

  useEffect(() => {
    if (comparisonMode === 'selected' && selectedBatches.length > 0) {
      loadComparisonData(selectedBatches)
    } else if (comparisonMode === 'all') {
      loadComparisonData()
    }
  }, [comparisonMode, selectedBatches, dateRange])

  const loadBatches = async () => {
    setLoading(true)
    const { data } = await getAllBatchesForComparison()
    if (data) {
      setAllBatches(data)
    }
    setLoading(false)
  }

  const loadComparisonData = async (batchIds?: string[]) => {
    setLoading(true)
    const range = dateRange.start && dateRange.end ? dateRange : undefined
    const { data } = await getBatchComparisonData(batchIds, range)
    if (data) {
      setComparisonData(data)
    }
    setLoading(false)
  }

  const parameters = [
    { key: 'moisture_content', label: 'Moisture Content (%)', color: '#2563eb' },
    { key: 'aflatoxin', label: 'Aflatoxin (ppb)', color: '#dc2626' },
    { key: 'foreign_matter', label: 'Foreign Matter (%)', color: '#16a34a' },
    { key: 'split_kernels', label: 'Split Kernels (%)', color: '#9333ea' },
    { key: 'shrivelled_kernels', label: 'Shrivelled Kernels (%)', color: '#ea580c' },
    { key: 'rotten_nuts', label: 'Rotten Nuts (%)', color: '#0891b2' },
    { key: 'mouldy_kernels', label: 'Mouldy Kernels (%)', color: '#c026d3' },
  ]

  const selectedParam = parameters.find((p) => p.key === selectedParameter)

  const handleBatchToggle = (batchId: string) => {
    setSelectedBatches((prev) =>
      prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]
    )
  }

  if (loading && comparisonData.length === 0) {
    return <LoadingState />
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-400 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 uppercase">Batch Quality Comparison</h1>
        <p className="text-sm text-gray-600 mt-1">Compare quality parameters across batches</p>
      </div>

      {/* Controls */}
      <div className="mb-6 bg-white border-2 border-gray-400 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Comparison Mode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Comparison Mode</label>
            <select
              value={comparisonMode}
              onChange={(e) => setComparisonMode(e.target.value as 'all' | 'selected')}
              className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="all">All Batches</option>
              <option value="selected">Selected Batches</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Parameter Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Parameter</label>
            <select
              value={selectedParameter}
              onChange={(e) => setSelectedParameter(e.target.value)}
              className="w-full border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
            >
              {parameters.map((param) => (
                <option key={param.key} value={param.key}>
                  {param.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Batch Selection (only shown in selected mode) */}
        {comparisonMode === 'selected' && (
          <div className="mt-4 pt-4 border-t-2 border-gray-400">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Batches to Compare</label>
            <div className="max-h-40 overflow-y-auto border-2 border-gray-400 p-2">
              {allBatches.map((batch) => (
                <label key={batch.id} className="flex items-center space-x-2 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBatches.includes(batch.id)}
                    onChange={() => handleBatchToggle(batch.id)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">{batch.batch_no} - {batch.production_date}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="mb-6 bg-white border-2 border-gray-400 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedParam?.label} Comparison
        </h2>
        {comparisonData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis
                dataKey="batch_no"
                stroke="#666"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedParameter as keyof BatchComparisonData}
                stroke={selectedParam?.color}
                strokeWidth={2}
                name={selectedParam?.label}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 border border-gray-300 bg-gray-50 flex items-center justify-center">
            <p className="text-sm text-gray-500">No data available for comparison</p>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white border-2 border-gray-400">
        <div className="bg-yellow-100 border-b-2 border-gray-400 px-4 py-2">
          <h2 className="text-sm font-semibold text-gray-900">Comparison Data</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Batch No</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Date</th>
                {parameters.map((param) => (
                  <th
                    key={param.key}
                    className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold"
                  >
                    {param.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-400 px-3 py-2 text-xs font-semibold">{row.batch_no}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs">{row.production_date}</td>
                  {parameters.map((param) => (
                    <td key={param.key} className="border border-gray-400 px-3 py-2 text-xs text-center">
                      {row[param.key as keyof BatchComparisonData] !== null
                        ? row[param.key as keyof BatchComparisonData]
                        : '-'}
                    </td>
                  ))}
                </tr>
              ))}
              {comparisonData.length === 0 && (
                <tr>
                  <td colSpan={parameters.length + 2} className="border border-gray-400 px-3 py-4 text-center text-sm text-gray-500">
                    No comparison data available
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
