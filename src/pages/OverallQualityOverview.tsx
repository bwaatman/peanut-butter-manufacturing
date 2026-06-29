import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { getOverallQualityOverview } from '../services/qualityMonitoring'
import { LoadingState } from '../components/ui/LoadingState'

export default function OverallQualityOverview() {
  const [overviewData, setOverviewData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'incoming' | 'sortex' | 'sorting' | 'roasting'>('incoming')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const data = await getOverallQualityOverview()
    setOverviewData(data)
    setLoading(false)
  }

  if (loading) {
    return <LoadingState />
  }

  if (!overviewData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border-2 border-red-400 p-4">
          Failed to load overview data
        </div>
      </div>
    )
  }

  const { incoming_data, sortex_data, sorting_data, roasting_data } = overviewData

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-400 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 uppercase">Overall Quality Overview</h1>
        <p className="text-sm text-gray-600 mt-1">Comprehensive view of all batches and quality parameters</p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-gray-400 p-4">
          <div className="text-xs font-semibold text-gray-700 mb-1">Incoming Receipts</div>
          <div className="text-3xl font-bold text-blue-600">{incoming_data.length}</div>
          <div className="text-xs text-gray-500 mt-1">Batches received</div>
        </div>
        <div className="bg-white border-2 border-gray-400 p-4">
          <div className="text-xs font-semibold text-gray-700 mb-1">Sortex Checks</div>
          <div className="text-3xl font-bold text-green-600">{sortex_data.length}</div>
          <div className="text-xs text-gray-500 mt-1">Hourly records</div>
        </div>
        <div className="bg-white border-2 border-gray-400 p-4">
          <div className="text-xs font-semibold text-gray-700 mb-1">Sorting Efficiency</div>
          <div className="text-3xl font-bold text-purple-600">{sorting_data.length}</div>
          <div className="text-xs text-gray-500 mt-1">Efficiency checks</div>
        </div>
        <div className="bg-white border-2 border-gray-400 p-4">
          <div className="text-xs font-semibold text-gray-700 mb-1">Roasting Checks</div>
          <div className="text-3xl font-bold text-orange-600">{roasting_data.length}</div>
          <div className="text-xs text-gray-500 mt-1">Temperature logs</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b-2 border-gray-400">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedTab('incoming')}
            className={`px-4 py-2 text-sm font-semibold ${
              selectedTab === 'incoming'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Incoming Receipt ({incoming_data.length})
          </button>
          <button
            onClick={() => setSelectedTab('sortex')}
            className={`px-4 py-2 text-sm font-semibold ${
              selectedTab === 'sortex'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sortex Checklist ({sortex_data.length})
          </button>
          <button
            onClick={() => setSelectedTab('sorting')}
            className={`px-4 py-2 text-sm font-semibold ${
              selectedTab === 'sorting'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sorting Efficiency ({sorting_data.length})
          </button>
          <button
            onClick={() => setSelectedTab('roasting')}
            className={`px-4 py-2 text-sm font-semibold ${
              selectedTab === 'roasting'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Roasting Temperature ({roasting_data.length})
          </button>
        </div>
      </div>

      {/* Incoming Receipt Tab */}
      {selectedTab === 'incoming' && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="bg-white border-2 border-gray-400 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quality Parameters Across All Batches</h2>
            {incoming_data.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={incoming_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis
                    dataKey="batches.batch_no"
                    stroke="#666"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="foreign_matter_3040_result" stroke="#2563eb" strokeWidth={2} name="Foreign Matter (%)" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="split_kernels_4050_result" stroke="#16a34a" strokeWidth={2} name="Split Kernels (%)" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="shrivelled_kernels_5060_result" stroke="#dc2626" strokeWidth={2} name="Shrivelled (%)" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="mouldy_kernels_6070_result" stroke="#9333ea" strokeWidth={2} name="Mouldy (%)" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="rotten_nuts_80100_result" stroke="#ea580c" strokeWidth={2} name="Rotten (%)" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 border border-gray-300 bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-500">No incoming receipt data available</p>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white border-2 border-gray-400">
            <div className="bg-yellow-100 border-b-2 border-gray-400 px-4 py-2">
              <h2 className="text-sm font-semibold text-gray-900">All Incoming Receipt Records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Batch ID</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Date</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Moisture</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Aflatoxin</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Foreign Matter</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Split Kernels</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Shrivelled</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Mouldy</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Live Insects</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Rotten</th>
                  </tr>
                </thead>
                <tbody>
                  {incoming_data.map((item: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-400 px-3 py-2 text-xs font-semibold">{item.batches?.batch_no || item.batch_id}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs">{item.batches?.production_date || item.receipt_date || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.moisture_content_result || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.aflatoxin_result || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.foreign_matter_3040_result || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.split_kernels_4050_result || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.shrivelled_kernels_5060_result || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.mouldy_kernels_6070_result || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.live_insects_7080_result || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.rotten_nuts_80100_result || '-'}</td>
                    </tr>
                  ))}
                  {incoming_data.length === 0 && (
                    <tr>
                      <td colSpan={10} className="border border-gray-400 px-3 py-4 text-center text-sm text-gray-500">
                        No incoming receipt data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sortex Checklist Tab */}
      {selectedTab === 'sortex' && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="bg-white border-2 border-gray-400 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sortex Parameters Across All Checks</h2>
            {sortex_data.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={sortex_data.slice(0, 50)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis
                    dataKey="batches.batch_no"
                    stroke="#666"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="moisture" stroke="#2563eb" strokeWidth={2} name="Moisture (%)" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="foreign_matter" stroke="#16a34a" strokeWidth={2} name="Foreign Matter (%)" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="odor" stroke="#dc2626" strokeWidth={2} name="Odor (score)" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="discolored" stroke="#9333ea" strokeWidth={2} name="Discolored (%)" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="splits" stroke="#ea580c" strokeWidth={2} name="Splits (%)" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 border border-gray-300 bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-500">No sortex checklist data available</p>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white border-2 border-gray-400">
            <div className="bg-yellow-100 border-b-2 border-gray-400 px-4 py-2">
              <h2 className="text-sm font-semibold text-gray-900">All Sortex Checklist Records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Batch ID</th>
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
                  {sortex_data.map((item: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-400 px-3 py-2 text-xs font-semibold">{item.batches?.batch_no || item.batch_id}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs">{item.form_date}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs">{item.check_time}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.moisture || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.foreign_matter || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.odor || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.discolored || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.different_variety || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.splits || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.shrivelled || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.live_insects || '-'}</td>
                    </tr>
                  ))}
                  {sortex_data.length === 0 && (
                    <tr>
                      <td colSpan={11} className="border border-gray-400 px-3 py-4 text-center text-sm text-gray-500">
                        No sortex checklist data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sorting Efficiency Tab */}
      {selectedTab === 'sorting' && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="bg-white border-2 border-gray-400 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sorting Efficiency Across All Batches</h2>
            {sorting_data.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sorting_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis
                    dataKey="batches.batch_no"
                    stroke="#666"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="moisture_percent" fill="#2563eb" name="Moisture (%)" />
                  <Bar dataKey="total_aflatoxin_ppb" fill="#dc2626" name="Aflatoxin (ppb)" />
                  <Bar dataKey="rotten_nuts_percent" fill="#16a34a" name="Rotten (%)" />
                  <Bar dataKey="shriveled_nuts_percent" fill="#9333ea" name="Shrivelled (%)" />
                  <Bar dataKey="overall_sorting_efficiency" fill="#ea580c" name="Efficiency (%)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 border border-gray-300 bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-500">No sorting efficiency data available</p>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white border-2 border-gray-400">
            <div className="bg-yellow-100 border-b-2 border-gray-400 px-4 py-2">
              <h2 className="text-sm font-semibold text-gray-900">All Sorting Efficiency Records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Batch ID</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Date</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Moisture</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Aflatoxin</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Rotten</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Shrivelled</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Over Roast</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Non Branched</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {sorting_data.map((item: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-400 px-3 py-2 text-xs font-semibold">{item.batches?.batch_no || item.batch_id}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs">{item.form_date}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.moisture_percent || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.total_aflatoxin_ppb || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.rotten_nuts_percent || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.shriveled_nuts_percent || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.over_roast_nuts_percent || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.non_branched_nuts_percent || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.overall_sorting_efficiency || '-'}</td>
                    </tr>
                  ))}
                  {sorting_data.length === 0 && (
                    <tr>
                      <td colSpan={9} className="border border-gray-400 px-3 py-4 text-center text-sm text-gray-500">
                        No sorting efficiency data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Roasting Temperature Tab */}
      {selectedTab === 'roasting' && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="bg-white border-2 border-gray-400 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Temperature Across All Checks</h2>
            {roasting_data.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={roasting_data.slice(0, 100)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis
                    dataKey="batches.batch_no"
                    stroke="#666"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#666" fontSize={12} domain={[130, 240]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="temperature" stroke="#2563eb" strokeWidth={2} name="Temperature (°C)" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 border border-gray-300 bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-500">No roasting temperature data available</p>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white border-2 border-gray-400">
            <div className="bg-yellow-100 border-b-2 border-gray-400 px-4 py-2">
              <h2 className="text-sm font-semibold text-gray-900">All Roasting Temperature Records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Batch ID</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Date</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Time</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Temperature</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-xs font-semibold">Within Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {roasting_data.map((item: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-400 px-3 py-2 text-xs font-semibold">{item.batches?.batch_no || item.batch_id}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs">{item.form_date}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs">{item.check_time}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">{item.temperature || '-'}</td>
                      <td className="border border-gray-400 px-3 py-2 text-xs text-center">
                        {item.within_limit !== null ? (
                          item.within_limit ? (
                            <span className="text-green-600 font-semibold">Yes</span>
                          ) : (
                            <span className="text-red-600 font-semibold">No</span>
                          )
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                  {roasting_data.length === 0 && (
                    <tr>
                      <td colSpan={5} className="border border-gray-400 px-3 py-4 text-center text-sm text-gray-500">
                        No roasting temperature data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
