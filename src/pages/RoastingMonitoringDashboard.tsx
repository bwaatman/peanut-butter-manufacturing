import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts'
import { getBatchById } from '../services/batches'
import { getRoastingTemperaturesByBatchId } from '../services/roastingTemperature'
import { calculateRoastingCompliance } from '../services/qualityMonitoring'
import type { Batch, RoastingTemperatureForm } from '../types/database'
import { LoadingState } from '../components/ui/LoadingState'
import { Alert } from '../components/ui/Alert'

export default function RoastingMonitoringDashboard() {
  const { batchId } = useParams<{ batchId: string }>()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [roastingLogs, setRoastingLogs] = useState<RoastingTemperatureForm[]>([])
  const [compliance, setCompliance] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (batchId) {
      loadData()
    }
  }, [batchId])

  const loadData = async () => {
    if (!batchId) return

    setLoading(true)
    const [batchResult, logsResult] = await Promise.all([
      getBatchById(batchId),
      getRoastingTemperaturesByBatchId(batchId),
    ])

    if (batchResult.data) setBatch(batchResult.data)
    if (logsResult.data) setRoastingLogs(logsResult.data)

    const complianceData = await calculateRoastingCompliance(batchId)
    setCompliance(complianceData)

    setLoading(false)
  }

  const getTemperatureStatus = (temp: number | null) => {
    if (temp === null) return 'none'
    if (temp < 137 || temp > 230) return 'critical'
    if (temp < 145 || temp > 220) return 'warning'
    return 'normal'
  }

  const prepareChartData = () => {
    return roastingLogs.map((log) => ({
      time: log.check_time,
      temperature: log.temperature,
      within_limit: log.within_limit,
      status: getTemperatureStatus(log.temperature),
    }))
  }

  const chartData = prepareChartData()

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
        <h1 className="text-2xl font-bold text-gray-900 uppercase">Roasting Temperature Monitoring</h1>
        <p className="text-sm text-gray-600 mt-1">
          Batch: {batch.batch_no} | {batch.product_name}
        </p>
      </div>

      {/* Compliance Summary */}
      {compliance && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-gray-400 p-4">
            <div className="text-xs font-semibold text-gray-700 mb-1">Compliance</div>
            <div className={`text-2xl font-bold ${
              compliance.compliance_percentage >= 80 ? 'text-green-600' : 'text-red-600'
            }`}>
              {compliance.compliance_percentage}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {compliance.completed_checks} / {compliance.expected_checks} checks
            </div>
          </div>
          <div className="bg-white border-2 border-gray-400 p-4">
            <div className="text-xs font-semibold text-gray-700 mb-1">Missed Checks</div>
            <div className={`text-2xl font-bold ${compliance.missed_checks.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {compliance.missed_checks.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Gaps &gt; 45 min</div>
          </div>
          <div className="bg-white border-2 border-gray-400 p-4">
            <div className="text-xs font-semibold text-gray-700 mb-1">Abnormal Temps</div>
            <div className={`text-2xl font-bold ${compliance.abnormal_temperatures > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {compliance.abnormal_temperatures}
            </div>
            <div className="text-xs text-gray-500 mt-1">Out of range (137-230°C)</div>
          </div>
          <div className="bg-white border-2 border-gray-400 p-4">
            <div className="text-xs font-semibold text-gray-700 mb-1">Suspicious Entries</div>
            <div className={`text-2xl font-bold ${compliance.suspicious_entries > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {compliance.suspicious_entries}
            </div>
            <div className="text-xs text-gray-500 mt-1">Repeated patterns</div>
          </div>
        </div>
      )}

      {/* Suspicious Entry Warning */}
      {compliance && compliance.suspicious_entries > 0 && (
        <div className="mb-6 bg-yellow-50 border-2 border-yellow-400 p-4">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">⚠ Review Roasting Log</h3>
          <p className="text-sm text-yellow-800">
            Suspicious entry patterns detected (repeated identical temperatures). Manager review recommended.
          </p>
        </div>
      )}

      {/* Temperature Chart */}
      <div className="mb-6 bg-white border-2 border-gray-400 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Temperature vs Time</h2>
        <div className="mb-4 text-sm text-gray-600">
          Expected range: 137°C - 230°C | Warning range: 145°C - 220°C | Expected interval: Every 30 minutes
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis
                dataKey="time"
                stroke="#666"
                fontSize={12}
              />
              <YAxis
                stroke="#666"
                fontSize={12}
                domain={[130, 240]}
              />
              <Tooltip />
              <Legend />
              <ReferenceArea y1={137} y2={230} fill="#dcfce7" fillOpacity={0.3} label="Safe Range" />
              <ReferenceArea y1={145} y2={220} fill="#fef3c7" fillOpacity={0.3} label="Warning Range" />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#2563eb"
                strokeWidth={2}
                name="Temperature (°C)"
                dot={{ r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 border border-gray-300 bg-gray-50 flex items-center justify-center">
            <p className="text-sm text-gray-500">No temperature records available yet</p>
          </div>
        )}
      </div>

      {/* Temperature Log Table */}
      <div className="bg-white border-2 border-gray-400">
        <div className="bg-yellow-100 border-b-2 border-gray-400 px-4 py-2">
          <h2 className="text-sm font-semibold text-gray-900">Temperature Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Date</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Time</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Temperature (°C)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Status</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Within Limit</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {roastingLogs.map((log, index) => {
                const status = getTemperatureStatus(log.temperature)
                const isMissed = compliance?.missed_checks.includes(log.check_time || '')
                
                return (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${isMissed ? 'bg-yellow-100' : ''}`}
                  >
                    <td className="border border-gray-400 px-3 py-2 text-xs">{log.form_date}</td>
                    <td className="border border-gray-400 px-3 py-2 text-xs">
                      {log.check_time}
                      {isMissed && <span className="ml-2 text-yellow-600 font-semibold">⚠ Missed</span>}
                    </td>
                    <td className={`border border-gray-400 px-3 py-2 text-xs text-center font-semibold ${
                      status === 'critical' ? 'bg-red-100 text-red-700' :
                      status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'text-gray-900'
                    }`}>
                      {log.temperature !== null ? `${log.temperature}°C` : '-'}
                      {status === 'critical' && ' ⚠'}
                      {status === 'warning' && ' ⚠'}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-xs">
                      {status === 'critical' && <span className="text-red-600 font-semibold">Out of Range</span>}
                      {status === 'warning' && <span className="text-yellow-600 font-semibold">Warning</span>}
                      {status === 'normal' && <span className="text-green-600 font-semibold">Normal</span>}
                      {status === 'none' && <span className="text-gray-500">-</span>}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-xs text-center">
                      {log.within_limit !== null ? (
                        log.within_limit ? (
                          <span className="text-green-600 font-semibold">Yes</span>
                        ) : (
                          <span className="text-red-600 font-semibold">No</span>
                        )
                      ) : '-'}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-xs">{log.remarks || '-'}</td>
                  </tr>
                )
              })}
              {roastingLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="border border-gray-400 px-3 py-4 text-center text-sm text-gray-500">
                    No temperature records available
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
