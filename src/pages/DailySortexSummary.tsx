import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getSortexDailySummaries, regenerateAllDailySummaries } from '../services/sortexSummaries'
import type { SortexDailySummary } from '../types/database'
import { LoadingState } from '../components/ui/LoadingState'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'

export default function DailySortexSummary() {
  const [dailyData, setDailyData] = useState<SortexDailySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const { data } = await getSortexDailySummaries()
    if (data) {
      setDailyData(data)
    }
    setLoading(false)
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    setMessage(null)

    const result = await regenerateAllDailySummaries()

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: `Regenerated ${result.data?.length} daily summaries` })
      await loadData()
    }

    setRegenerating(false)
  }

  const parameters = [
    { name: 'Foreign matter', standard: '< 1%' },
    { name: 'Odor', standard: '≥ 4.0' },
    { name: 'Discolored', standard: '< 2%' },
    { name: 'Diff. Variety', standard: '< 1%' },
    { name: 'Moisture', standard: '< 8%' },
    { name: 'Splits', standard: '< 3%' },
    { name: 'Shrivelled nuts', standard: '< 1%' },
    { name: 'Live insects', standard: '0' },
  ]

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-400 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 uppercase">Daily Sortex QC Summary</h1>
        <p className="text-sm text-gray-600 mt-1">Auto-calculated from hourly QA checks</p>
      </div>

      {/* Alert Message */}
      {message && (
        <Alert type={message.type}>
          {message.text}
        </Alert>
      )}

      {/* Regenerate Button */}
      <div className="mb-6">
        <Button
          onClick={handleRegenerate}
          disabled={regenerating}
        >
          {regenerating ? 'Regenerating...' : 'Regenerate Daily Summaries from Hourly Data'}
        </Button>
      </div>

      {/* Daily Chart */}
      <div className="mb-8 bg-white border-2 border-gray-400 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily - Selected Averages</h2>
        {dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avg_foreign_matter" stroke="#2563eb" strokeWidth={2} name="Foreign Matter (%)" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="avg_odor" stroke="#16a34a" strokeWidth={2} name="Odor (score)" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="avg_discolored" stroke="#dc2626" strokeWidth={2} name="Discolored (%)" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="avg_different_variety" stroke="#9333ea" strokeWidth={2} name="Diff Variety (%)" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="avg_moisture" stroke="#ea580c" strokeWidth={2} name="Moisture (%)" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 border border-gray-300 bg-gray-50 flex items-center justify-center">
            <p className="text-sm text-gray-500">No data available for chart. Click "Regenerate Daily Summaries" to create summaries from hourly data.</p>
          </div>
        )}
      </div>

      {/* Daily Summary Table */}
      <div className="mb-8 bg-white border-2 border-gray-400">
        <div className="bg-yellow-100 border-b-2 border-gray-400 px-4 py-2">
          <h2 className="text-sm font-semibold text-gray-900">Daily Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Date</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Samples Count</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Avg Foreign Matter (%)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Avg Odor (score)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Avg Discolored (%)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Avg Different Variety (%)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Avg Moisture (%)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Avg Splits (%)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Avg Shrivelled (%)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Avg Live Insects (count)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">WeekNum</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-400 px-3 py-2 text-xs">{row.date}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.samples_count}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.avg_foreign_matter}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.avg_odor}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.avg_discolored}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.avg_different_variety}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.avg_moisture}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.avg_splits}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.avg_shrivelled}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.avg_live_insects}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.week_num}</td>
                </tr>
              ))}
              {dailyData.length === 0 && (
                <tr>
                  <td colSpan={11} className="border border-gray-400 px-3 py-4 text-center text-sm text-gray-500">
                    No daily summaries available. Data will auto-calculate from hourly QA checks.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parameter / Standard Table */}
      <div className="absolute bottom-6 right-6 w-80 bg-white border-2 border-gray-400">
        <div className="bg-yellow-100 border-b-2 border-gray-400 px-4 py-2">
          <h3 className="text-sm font-semibold text-gray-900">Parameter / Standard</h3>
        </div>
        <table className="w-full border-collapse">
          <tbody>
            {parameters.map((param, index) => (
              <tr key={index}>
                <td className="border border-gray-400 px-3 py-2 text-xs">{param.name}</td>
                <td className="border border-gray-400 px-3 py-2 text-xs text-center">{param.standard}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
