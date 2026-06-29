import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getSortexWeeklySummaries, regenerateAllWeeklySummaries } from '../services/sortexSummaries'
import type { SortexWeeklySummary } from '../types/database'
import { LoadingState } from '../components/ui/LoadingState'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'

export default function WeeklySortexSummary() {
  const [weeklyData, setWeeklyData] = useState<SortexWeeklySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const currentYear = new Date().getFullYear()
    const { data } = await getSortexWeeklySummaries(currentYear)
    if (data) {
      setWeeklyData(data)
    }
    setLoading(false)
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    setMessage(null)

    const result = await regenerateAllWeeklySummaries()

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: `Regenerated ${result.data?.length} weekly summaries` })
      await loadData()
    }

    setRegenerating(false)
  }

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-400 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 uppercase">Weekly Summary / Batch Info</h1>
        <p className="text-sm text-gray-600 mt-1">Auto-calculated from Daily Summary data</p>
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
          {regenerating ? 'Regenerating...' : 'Regenerate Weekly Summaries from Daily Data'}
        </Button>
      </div>

      {/* Weekly Chart */}
      <div className="mb-8 bg-white border-2 border-gray-400 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly - Selected Averages</h2>
        {weeklyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="week_num" stroke="#666" fontSize={12} label={{ value: 'Week Number', position: 'insideBottom', offset: -5 }} />
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
            <p className="text-sm text-gray-500">No data available for chart. Click "Regenerate Weekly Summaries" to create summaries from daily data.</p>
          </div>
        )}
      </div>

      {/* Weekly Summary Table */}
      <div className="mb-8 bg-white border-2 border-gray-400">
        <div className="bg-yellow-100 border-b-2 border-gray-400 px-4 py-2">
          <h2 className="text-sm font-semibold text-gray-900">Weekly Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">WeekNum</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Avg Foreign Matter (%)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Avg Odor (score)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Avg Discolored (%)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Avg Different Variety (%)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Avg Moisture (%)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Avg Splits (%)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Avg Shrivelled (%)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Avg Live Insects (count)</th>
              </tr>
            </thead>
            <tbody>
              {weeklyData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center font-semibold">{row.week_num}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.avg_foreign_matter}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.avg_odor}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.avg_discolored}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.avg_different_variety}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.avg_moisture}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.avg_splits}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.avg_shrivelled}</td>
                  <td className="border border-gray-400 px-3 py-2 text-xs text-center">{row.avg_live_insects}</td>
                </tr>
              ))}
              {weeklyData.length === 0 && (
                <tr>
                  <td colSpan={9} className="border border-gray-400 px-3 py-4 text-center text-sm text-gray-500">
                    No weekly summaries available. Data will auto-calculate from daily summaries.
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
