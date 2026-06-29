import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getBatchById } from '../services/batches'
import { getSortexHourlyRecords } from '../services/sortexChecklist'
import { getQualityAlertThresholds, getBatchAlerts } from '../services/qualityMonitoring'
import type { Batch } from '../types/database'
import { LoadingState } from '../components/ui/LoadingState'
import { Alert } from '../components/ui/Alert'

export default function SortexLiveMonitoring() {
  const { batchId } = useParams<{ batchId: string }>()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [hourlyRecords, setHourlyRecords] = useState<any[]>([])
  const [thresholds, setThresholds] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedParameter, setSelectedParameter] = useState('moisture')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (batchId) {
      loadData()
    }
  }, [batchId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh && batchId) {
      interval = setInterval(() => {
        loadHourlyRecords()
        loadAlerts()
      }, 30000) // Refresh every 30 seconds
    }
    return () => clearInterval(interval)
  }, [autoRefresh, batchId])

  const loadData = async () => {
    if (!batchId) return

    setLoading(true)
    const [batchResult, recordsResult, thresholdsResult, alertsResult] = await Promise.all([
      getBatchById(batchId),
      getSortexHourlyRecords(batchId),
      getQualityAlertThresholds(),
      getBatchAlerts(batchId, false),
    ])

    if (batchResult.data) setBatch(batchResult.data)
    if (recordsResult.data) setHourlyRecords(recordsResult.data)
    if (thresholdsResult.data) setThresholds(thresholdsResult.data)
    if (alertsResult.data) setAlerts(alertsResult.data)

    setLoading(false)
  }

  const loadHourlyRecords = async () => {
    if (!batchId) return
    const { data } = await getSortexHourlyRecords(batchId)
    if (data) setHourlyRecords(data)
  }

  const loadAlerts = async () => {
    if (!batchId) return
    const { data } = await getBatchAlerts(batchId, false)
    if (data) setAlerts(data)
  }

  const parameters = [
    { key: 'moisture', label: 'Moisture (%)', color: '#2563eb', unit: '%' },
    { key: 'foreign_matter', label: 'Foreign Matter (%)', color: '#dc2626', unit: '%' },
    { key: 'odor', label: 'Odor (score)', color: '#16a34a', unit: '' },
    { key: 'discolored', label: 'Discolored (%)', color: '#9333ea', unit: '%' },
    { key: 'different_variety', label: 'Different Variety (%)', color: '#ea580c', unit: '%' },
    { key: 'splits', label: 'Splits (%)', color: '#0891b2', unit: '%' },
    { key: 'shrivelled', label: 'Shrivelled (%)', color: '#c026d3', unit: '%' },
    { key: 'live_insects', label: 'Live Insects (count)', color: '#f59e0b', unit: '' },
  ]

  const selectedParam = parameters.find((p) => p.key === selectedParameter)

  const getThresholdForParameter = (paramKey: string) => {
    return thresholds.find((t) => t.parameter_name === paramKey)
  }

  const isValueAbnormal = (value: number | null, paramKey: string) => {
    if (value === null) return false
    const threshold = getThresholdForParameter(paramKey)
    if (!threshold) return false
    if (threshold.min_value !== null && value < threshold.min_value) return true
    if (threshold.max_value !== null && value > threshold.max_value) return true
    return false
  }

  const getAlertForParameter = (paramKey: string) => {
    return alerts.find((a) => a.parameter_name === paramKey && !a.resolved)
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
        <h1 className="text-2xl font-bold text-gray-900 uppercase">Sortex Live Progress Monitoring</h1>
        <p className="text-sm text-gray-600 mt-1">
          Batch: {batch.batch_no} | {batch.product_name}
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 bg-white border-2 border-gray-400 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-semibold text-gray-700">Parameter:</label>
            <select
              value={selectedParameter}
              onChange={(e) => setSelectedParameter(e.target.value)}
              className="border-2 border-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
            >
              {parameters.map((param) => (
                <option key={param.key} value={param.key}>
                  {param.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-semibold text-gray-700">Auto-refresh (30s)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 bg-red-50 border-2 border-red-400 p-4">
          <h3 className="text-sm font-semibold text-red-900 mb-2">Active Alerts</h3>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="text-sm text-red-800">
                <span className="font-semibold">{alert.alert_type}:</span> {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Threshold Info */}
      {selectedParam && (
        <div className="mb-6 bg-yellow-50 border-2 border-yellow-400 p-4">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">Threshold Information</h3>
          <div className="text-sm text-yellow-800">
            {getThresholdForParameter(selectedParam.key) ? (
              <div>
                <span className="font-semibold">{selectedParam.label}</span>: Min {getThresholdForParameter(selectedParam.key)?.min_value} - Max {getThresholdForParameter(selectedParam.key)?.max_value}
              </div>
            ) : (
              <div>No threshold configured for {selectedParam.label}</div>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="mb-6 bg-white border-2 border-gray-400 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedParam?.label} Over Time
        </h2>
        {hourlyRecords.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={hourlyRecords}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis
                dataKey="check_time"
                stroke="#666"
                fontSize={12}
              />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedParameter}
                stroke={selectedParam?.color}
                strokeWidth={2}
                name={selectedParam?.label}
                dot={{ r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 border border-gray-300 bg-gray-50 flex items-center justify-center">
            <p className="text-sm text-gray-500">No hourly records available yet</p>
          </div>
        )}
      </div>

      {/* Parameters Grid */}
      <div className="mb-6 bg-white border-2 border-gray-400 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Values</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {parameters.map((param) => {
            const latestRecord = hourlyRecords[hourlyRecords.length - 1]
            const value = latestRecord ? latestRecord[param.key] : null
            const isAbnormal = isValueAbnormal(value, param.key)
            const alert = getAlertForParameter(param.key)

            return (
              <div
                key={param.key}
                className={`p-4 border-2 ${
                  isAbnormal || alert ? 'border-red-500 bg-red-50' : 'border-gray-400 bg-white'
                }`}
              >
                <div className="text-xs font-semibold text-gray-700 mb-1">{param.label}</div>
                <div className={`text-xl font-bold ${isAbnormal || alert ? 'text-red-600' : 'text-gray-900'}`}>
                  {value !== null ? `${value}${param.unit}` : '-'}
                </div>
                {isAbnormal && (
                  <div className="text-xs text-red-600 mt-1">⚠ Abnormal</div>
                )}
                {alert && (
                  <div className="text-xs text-red-600 mt-1">⚠ Alert</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Hourly Records Table */}
      <div className="bg-white border-2 border-gray-400">
        <div className="bg-yellow-100 border-b-2 border-gray-400 px-4 py-2">
          <h2 className="text-sm font-semibold text-gray-900">Hourly Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Time</th>
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
              {hourlyRecords.map((record, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-400 px-3 py-2 text-xs">{record.check_time}</td>
                  {parameters.map((param) => {
                    const value = record[param.key]
                    const isAbnormal = isValueAbnormal(value, param.key)
                    return (
                      <td
                        key={param.key}
                        className={`border border-gray-400 px-3 py-2 text-xs text-center ${
                          isAbnormal ? 'bg-red-100 font-semibold text-red-700' : ''
                        }`}
                      >
                        {value !== null ? `${value}${param.unit}` : '-'}
                        {isAbnormal && ' ⚠'}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {hourlyRecords.length === 0 && (
                <tr>
                  <td colSpan={parameters.length + 1} className="border border-gray-400 px-3 py-4 text-center text-sm text-gray-500">
                    No hourly records available
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
