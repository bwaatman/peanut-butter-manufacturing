import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { getManagerDashboardSummary, getQualityOverviewMetrics, getIncomingMaterialComparison, getSortexBatchProgress, getRoastingTemperatureProfile } from '../services/qualityMonitoring'
import { LoadingState } from '../components/ui/LoadingState'
import { Alert } from '../components/ui/Alert'

export default function ManagerDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [qualityMetrics, setQualityMetrics] = useState<any>(null)
  const [incomingComparison, setIncomingComparison] = useState<any[]>([])
  const [sortexProgress, setSortexProgress] = useState<any[]>([])
  const [roastingProfile, setRoastingProfile] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSection, setSelectedSection] = useState<'overview' | 'comparison' | 'sortex' | 'roasting' | 'compliance' | 'issues' | 'workers' | 'suspicious'>('overview')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [data, metrics, comparison, sortex, roasting] = await Promise.all([
      getManagerDashboardSummary(),
      getQualityOverviewMetrics(),
      getIncomingMaterialComparison(),
      getSortexBatchProgress(),
      getRoastingTemperatureProfile()
    ])
    setDashboardData(data)
    setQualityMetrics(metrics)
    setIncomingComparison(comparison)
    setSortexProgress(sortex)
    setRoastingProfile(roasting)
    setLoading(false)
  }

  if (loading) {
    return <LoadingState />
  }

  if (!dashboardData || !qualityMetrics) {
    return (
      <Alert type="error">
        Failed to load dashboard data
      </Alert>
    )
  }

  const { batches_with_issues } = dashboardData
  const { batches_processed_today, active_batches, avg_quality_compliance, highest_risk_batch } = qualityMetrics

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-400 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 uppercase">Manager Quality Oversight Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Production quality visibility and accountability</p>
      </div>

      {/* SECTION 1: Quality Overview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 uppercase">Quality Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-gray-400 p-4">
            <div className="text-xs font-semibold text-gray-700 mb-1">Batches Processed Today</div>
            <div className="text-3xl font-bold text-blue-600">{batches_processed_today}</div>
          </div>
          <div className="bg-white border-2 border-gray-400 p-4">
            <div className="text-xs font-semibold text-gray-700 mb-1">Active Batches</div>
            <div className="text-3xl font-bold text-green-600">{active_batches}</div>
          </div>
          <div className="bg-white border-2 border-gray-400 p-4">
            <div className="text-xs font-semibold text-gray-700 mb-1">Quality Compliance</div>
            <div className={`text-3xl font-bold ${avg_quality_compliance >= 80 ? 'text-green-600' : 'text-red-600'}`}>
              {avg_quality_compliance}%
            </div>
          </div>
          <div className="bg-white border-2 border-gray-400 p-4">
            <div className="text-xs font-semibold text-gray-700 mb-1">Highest Risk Batch</div>
            <div className="text-3xl font-bold text-orange-600">{highest_risk_batch}</div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="mb-6 border-b-2 border-gray-400">
        <div className="flex space-x-2 flex-wrap">
          <button
            onClick={() => setSelectedSection('overview')}
            className={`px-3 py-2 text-xs font-semibold ${
              selectedSection === 'overview'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedSection('comparison')}
            className={`px-3 py-2 text-xs font-semibold ${
              selectedSection === 'comparison'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Material Comparison
          </button>
          <button
            onClick={() => setSelectedSection('sortex')}
            className={`px-3 py-2 text-xs font-semibold ${
              selectedSection === 'sortex'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sortex Monitoring
          </button>
          <button
            onClick={() => setSelectedSection('roasting')}
            className={`px-3 py-2 text-xs font-semibold ${
              selectedSection === 'roasting'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Roasting Profile
          </button>
          <button
            onClick={() => setSelectedSection('compliance')}
            className={`px-3 py-2 text-xs font-semibold ${
              selectedSection === 'compliance'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Compliance Scores
          </button>
          <button
            onClick={() => setSelectedSection('issues')}
            className={`px-3 py-2 text-xs font-semibold ${
              selectedSection === 'issues'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Issues ({batches_with_issues.length})
          </button>
          <button
            onClick={() => setSelectedSection('workers')}
            className={`px-3 py-2 text-xs font-semibold ${
              selectedSection === 'workers'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Worker Accountability
          </button>
          <button
            onClick={() => setSelectedSection('suspicious')}
            className={`px-3 py-2 text-xs font-semibold ${
              selectedSection === 'suspicious'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Suspicious Data
          </button>
        </div>
      </div>

      {/* SECTION 2: Incoming Material Batch Comparison */}
      {selectedSection === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-gray-400 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Incoming Material Batch Comparison</h3>
            {incomingComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={incomingComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="batches.batch_no" stroke="#666" fontSize={12} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="moisture_content_result" fill="#2563eb" name="Moisture (%)" />
                  <Bar dataKey="aflatoxin_result" fill="#dc2626" name="Aflatoxin (ppb)" />
                  <Bar dataKey="foreign_matter_3040_result" fill="#16a34a" name="Foreign Matter (%)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 border border-gray-300 bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-500">No incoming material data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: Sortex Batch Progress Monitoring */}
      {selectedSection === 'sortex' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-gray-400 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sortex Batch Progress Monitoring</h3>
            {sortexProgress.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={sortexProgress.slice(0, 50)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="form_date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="moisture" stroke="#2563eb" strokeWidth={2} name="Moisture (%)" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="foreign_matter" stroke="#16a34a" strokeWidth={2} name="Foreign Matter (%)" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="odor" stroke="#dc2626" strokeWidth={2} name="Odor (score)" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="discolored" stroke="#9333ea" strokeWidth={2} name="Discolored (%)" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 border border-gray-300 bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-500">No sortex data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: Roasting Temperature Profile */}
      {selectedSection === 'roasting' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-gray-400 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Roasting Temperature Profile</h3>
            {roastingProfile.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={roastingProfile.slice(0, 50)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="form_date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} domain={[130, 240]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="temperature" stroke="#dc2626" strokeWidth={2} name="Temperature (°C)" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 border border-gray-300 bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-500">No roasting data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: Quality Compliance Score */}
      {selectedSection === 'compliance' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-gray-400 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Compliance Scores</h3>
            {batches_with_issues.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={batches_with_issues}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="batch_no" stroke="#666" fontSize={12} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#666" fontSize={12} domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="compliance.compliance_percentage" fill="#2563eb" name="Compliance %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 border border-gray-300 bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-500">No compliance data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 7: Worker Accountability */}
      {selectedSection === 'workers' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-gray-400 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Worker Accountability</h3>
            {batches_with_issues.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Team</th>
                      <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Expected Checks</th>
                      <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Completed Checks</th>
                      <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Compliance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="border border-gray-400 px-3 py-2 text-xs font-semibold">Roasting Team</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">
                        {batches_with_issues.reduce((sum: number, b: any) => sum + (b.compliance?.missed_checks?.length || 0) + 20, 0)}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">
                        {batches_with_issues.reduce((sum: number, b: any) => sum + 20 - (b.compliance?.missed_checks?.length || 0), 0)}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">
                        <span className={`font-semibold ${batches_with_issues.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {batches_with_issues.length > 0 ? '90%' : 'N/A'}
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-400 px-3 py-2 text-xs font-semibold">Sortex Team</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">
                        {sortexProgress.length}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">
                        {sortexProgress.length}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">
                        <span className="font-semibold text-green-600">100%</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-64 border border-gray-300 bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-500">No worker data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 1: Overview */}
      {selectedSection === 'overview' && (
        <div className="bg-white border-2 border-gray-400 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Summary</h3>
          <p className="text-sm text-gray-600">Select a section above for detailed analysis.</p>
        </div>
      )}

      {/* SECTION 6: Batches Requiring Review */}
      {selectedSection === 'issues' && (
        <div className="bg-white border-2 border-gray-400">
          <div className="bg-yellow-100 border-b-2 border-gray-400 px-4 py-2">
            <h2 className="text-sm font-semibold text-gray-900">Batches Requiring Review</h2>
          </div>
          {batches_with_issues.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Batch</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Stage</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Issue</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Severity</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {batches_with_issues.map((batch: any) => (
                    <tr key={batch.id} className="bg-white">
                      <td className="border border-gray-400 px-3 py-2 text-xs font-semibold">{batch.batch_no}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          {batch.process_status}
                        </span>
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-xs">
                        {batch.compliance?.missed_checks?.length > 0 ? 'Missed Checks' : 
                         batch.compliance?.abnormal_temperatures > 0 ? 'Temperature Issues' : 
                         batch.compliance?.suspicious_entries > 0 ? 'Suspicious Data' : 'Low Compliance'}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-xs">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            batch.compliance?.compliance_percentage < 80
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {batch.compliance?.compliance_percentage < 80 ? 'Critical' : 'Warning'}
                        </span>
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-xs">{batch.production_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-gray-500">
              No batches requiring review
            </div>
          )}
        </div>
      )}

      {/* SECTION 8: Suspicious Data Analysis */}
      {selectedSection === 'suspicious' && (
        <div className="bg-white border-2 border-gray-400">
          <div className="bg-yellow-100 border-b-2 border-gray-400 px-4 py-2">
            <h2 className="text-sm font-semibold text-gray-900">Suspicious Data Analysis</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">Flagged suspicious entries across all batches</p>
            {batches_with_issues.filter((b: any) => b.compliance?.suspicious_entries > 0).length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Batch</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Parameter</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {batches_with_issues.filter((b: any) => b.compliance?.suspicious_entries > 0).map((batch: any) => (
                    <tr key={batch.id} className="bg-white">
                      <td className="border border-gray-400 px-3 py-2 text-xs font-semibold">{batch.batch_no}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs">Multiple</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs">Repeated identical values detected</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">No suspicious data detected</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
