import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBatchTraceability } from '../services/traceability'
import type { BatchTraceability as BatchTraceabilityType } from '../services/traceability'
import { ArrowLeft, ClipboardList, Thermometer, CheckCircle, Package, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table'
import { StatusBadge } from '../components/ui/StatusBadge'
import { LoadingState } from '../components/ui/LoadingState'
import { Alert } from '../components/ui/Alert'

export default function BatchTraceability() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()
  const [traceability, setTraceability] = useState<BatchTraceabilityType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTraceability()
  }, [batchId])

  const loadTraceability = async () => {
    if (!batchId) return

    const data = await getBatchTraceability(batchId)
    setTraceability(data)
    setLoading(false)
  }

  if (loading) {
    return <LoadingState />
  }

  if (!traceability) {
    return (
      <Alert type="error">
        Batch not found
      </Alert>
    )
  }

  const { batch, incomingReceipt, sortingEfficiency, roastingTemperatures, finishedGoods } = traceability

  const stages = [
    {
      name: 'Incoming Receipt',
      icon: Package,
      completed: !!incomingReceipt,
      data: incomingReceipt,
      link: `/incoming-receipt/${batchId}`,
      fields: [
        { label: 'Receipt Date', value: incomingReceipt?.receipt_date },
        { label: 'Supplier', value: incomingReceipt?.supplier_name },
        { label: 'Quantity (kg)', value: incomingReceipt?.quantity_received_kg },
        { label: 'Received By', value: incomingReceipt?.received_by },
      ]
    },
    {
      name: 'Sorting Efficiency',
      icon: ClipboardList,
      completed: !!sortingEfficiency,
      data: sortingEfficiency,
      link: `/sorting-efficiency/${batchId}`,
      fields: [
        { label: 'Form Date', value: sortingEfficiency?.form_date },
        { label: 'Moisture (%)', value: sortingEfficiency?.moisture_percent },
        { label: 'Aflatoxin (ppb)', value: sortingEfficiency?.total_aflatoxin_ppb },
        { label: 'Result', value: sortingEfficiency?.result },
      ]
    },
    {
      name: 'Roasting Temperature',
      icon: Thermometer,
      completed: roastingTemperatures.length > 0,
      data: roastingTemperatures,
      link: `/roasting-temperature/${batchId}`,
      isTable: true
    },
    {
      name: 'Finished Goods',
      icon: CheckCircle,
      completed: !!finishedGoods,
      data: finishedGoods,
      link: `/finished-goods/${batchId}`,
      fields: [
        { label: 'Finished Date', value: finishedGoods?.finished_date },
        { label: 'Quantity (kg)', value: finishedGoods?.quantity_produced_kg },
        { label: 'QC Result', value: finishedGoods?.qc_result },
        { label: 'Approved By', value: finishedGoods?.approved_by },
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/batches')}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Batches
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Batch Traceability</h1>
        <p className="mt-1 text-sm text-gray-500">Batch Number: {batch.batch_no}</p>
      </div>

      {/* Batch Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-gray-500">Batch Number</p>
              <p className="text-lg font-semibold text-gray-900">{batch.batch_no}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Production Date</p>
              <p className="text-lg font-semibold text-gray-900">{batch.production_date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Product Name</p>
              <p className="text-lg font-semibold text-gray-900">{batch.product_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Process Status</p>
              <StatusBadge status={batch.process_status} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Production Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {stages.map((stage, index) => {
              const Icon = stage.icon
              return (
                <div key={stage.name} className="relative">
                  {/* Timeline Line */}
                  {index < stages.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                  )}

                  {/* Stage Card */}
                  <div className="flex items-start space-x-4">
                    {/* Icon Circle */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      stage.completed ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        stage.completed ? 'text-primary-700' : 'text-gray-400'
                      }`} />
                    </div>

                    {/* Stage Content */}
                    <div className="flex-1 bg-white border rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{stage.name}</h3>
                          <StatusBadge status={stage.completed ? 'completed' : 'pending'} />
                        </div>
                        {!stage.completed ? (
                          <Link to={stage.link}>
                            <Button size="sm">
                              Add Record
                            </Button>
                          </Link>
                        ) : (
                          <Link to={stage.link}>
                            <Button variant="outline" size="sm">
                              View Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>

                      {stage.completed && stage.fields && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {stage.fields.map((field) => (
                            <div key={field.label}>
                              <p className="text-gray-500">{field.label}</p>
                              <p className="font-medium text-gray-900">{field.value || 'N/A'}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {stage.completed && stage.isTable && stage.data && (
                        <div className="mt-3">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Temperature</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(stage.data as any[]).slice(0, 3).map((log: any) => (
                                <TableRow key={log.id}>
                                  <TableCell>{log.form_date}</TableCell>
                                  <TableCell>{log.check_time}</TableCell>
                                  <TableCell>{log.temperature}°C</TableCell>
                                  <TableCell>
                                    {log.within_limit ? (
                                      <span className="text-green-700 text-sm">Within Limit</span>
                                    ) : (
                                      <span className="text-red-700 text-sm">Out of Range</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {(stage.data as any[]).length > 3 && (
                            <p className="text-sm text-gray-500 mt-2">
                              +{(stage.data as any[]).length - 3} more logs
                            </p>
                          )}
                        </div>
                      )}

                      {!stage.completed && (
                        <p className="text-sm text-gray-500 mt-2">
                          No data recorded yet. Click "Add Record" to begin.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
