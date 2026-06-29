import { supabase } from '../lib/supabase'
import type {
  BatchComparisonData,
  QualityAlertThreshold,
  QualityAlert,
  RoastingCompliance,
} from '../types/database'

// Get batch comparison data for selected batches
export async function getBatchComparisonData(
  batchIds?: string[],
  dateRange?: { start: string; end: string }
) {
  let query = supabase
    .from('incoming_receipts')
    .select(`
      batch_id,
      batches!inner (
        id,
        batch_no,
        production_date
      ),
      moisture_content_result,
      aflatoxin_result,
      foreign_matter_3040_result,
      split_kernels_4050_result,
      shrivelled_kernels_5060_result,
      rotten_nuts_80100_result,
      mouldy_kernels_6070_result
    `)

  if (batchIds && batchIds.length > 0) {
    query = query.in('batch_id', batchIds)
  }

  if (dateRange) {
    query = query.gte('batches.production_date', dateRange.start)
    query = query.lte('batches.production_date', dateRange.end)
  }

  const { data, error } = await query.order('batches.production_date', { ascending: true })

  if (error) return { error }

  // Transform data to BatchComparisonData format
  const comparisonData: BatchComparisonData[] = (data || []).map((item: any) => ({
    batch_id: item.batch_id,
    batch_no: item.batches.batch_no,
    production_date: item.batches.production_date,
    moisture_content: item.moisture_content_result ? parseFloat(item.moisture_content_result) : null,
    aflatoxin: item.aflatoxin_result ? parseFloat(item.aflatoxin_result) : null,
    foreign_matter: item.foreign_matter_3040_result ? parseFloat(item.foreign_matter_3040_result) : null,
    split_kernels: item.split_kernels_4050_result ? parseFloat(item.split_kernels_4050_result) : null,
    shrivelled_kernels: item.shrivelled_kernels_5060_result ? parseFloat(item.shrivelled_kernels_5060_result) : null,
    rotten_nuts: item.rotten_nuts_80100_result ? parseFloat(item.rotten_nuts_80100_result) : null,
    mouldy_kernels: item.mouldy_kernels_6070_result ? parseFloat(item.mouldy_kernels_6070_result) : null,
  }))

  return { data: comparisonData, error: null }
}

// Get all batches for comparison selection
export async function getAllBatchesForComparison() {
  const { data, error } = await supabase
    .from('batches')
    .select('id, batch_no, production_date, product_name')
    .order('production_date', { ascending: false })

  return { data, error }
}

// Get quality alert thresholds
export async function getQualityAlertThresholds() {
  const { data, error } = await supabase
    .from('quality_alert_thresholds')
    .select('*')
    .order('parameter_name')

  return { data, error }
}

// Create quality alert
export async function createQualityAlert(alert: Omit<QualityAlert, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('quality_alerts')
    .insert(alert)
    .select()
    .single()

  return { data, error }
}

// Get alerts for a batch
export async function getBatchAlerts(batchId: string, includeResolved = false) {
  let query = supabase
    .from('quality_alerts')
    .select('*')
    .eq('batch_id', batchId)
    .order('created_at', { ascending: false })

  if (!includeResolved) {
    query = query.eq('resolved', false)
  }

  const { data, error } = await query

  return { data, error }
}

// Get all unresolved alerts for manager dashboard
export async function getAllUnresolvedAlerts() {
  const { data, error } = await supabase
    .from('quality_alerts')
    .select(`
      *,
      batches!inner (
        batch_no,
        production_date
      )
    `)
    .eq('resolved', false)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Resolve alert
export async function resolveAlert(alertId: string, resolvedBy: string) {
  const { data, error } = await supabase
    .from('quality_alerts')
    .update({
      resolved: true,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', alertId)
    .select()
    .single()

  return { data, error }
}

// Calculate roasting compliance
export async function calculateRoastingCompliance(batchId: string): Promise<RoastingCompliance | null> {
  // Get batch info
  const { data: batch } = await supabase
    .from('batches')
    .select('batch_no, production_date')
    .eq('id', batchId)
    .single()

  if (!batch) return null

  // Get all roasting temperature records for the batch
  const { data: roastingLogs } = await supabase
    .from('roasting_temperature_forms')
    .select('check_time, temperature, within_limit, form_date')
    .eq('batch_id', batchId)
    .order('form_date, check_time')

  if (!roastingLogs || roastingLogs.length === 0) {
    return {
      batch_id: batchId,
      batch_no: batch.batch_no,
      expected_checks: 0,
      completed_checks: 0,
      compliance_percentage: 0,
      missed_checks: [],
      abnormal_temperatures: 0,
      out_of_range_count: 0,
      suspicious_entries: 0,
    }
  }

  // Calculate expected checks based on date range (assuming 8-hour roasting process, checks every 30 minutes)
  // This is a simplified calculation - in production, you'd use actual roasting start/end times
  const completedChecks = roastingLogs.length
  const expectedChecks = Math.max(completedChecks, 16) // Assume at least 16 checks for 8 hours
  const compliancePercentage = Math.round((completedChecks / expectedChecks) * 100)

  // Detect abnormal temperatures
  const abnormalTemperatures = roastingLogs.filter(
    (log) => log.temperature && (log.temperature < 137 || log.temperature > 230)
  ).length

  // Detect out of range
  const outOfRangeCount = roastingLogs.filter((log) => log.within_limit === false).length

  // Detect suspicious entries (repeated identical temperatures)
  const tempCounts = new Map<number, number>()
  roastingLogs.forEach((log) => {
    if (log.temperature) {
      tempCounts.set(log.temperature, (tempCounts.get(log.temperature) || 0) + 1)
    }
  })
  const suspiciousEntries = Array.from(tempCounts.values()).filter((count) => count >= 3).length

  // Identify missed checks (gaps > 45 minutes)
  const missedChecks: string[] = []
  for (let i = 1; i < roastingLogs.length; i++) {
    const prevTime = new Date(`${roastingLogs[i - 1].form_date}T${roastingLogs[i - 1].check_time}`)
    const currTime = new Date(`${roastingLogs[i].form_date}T${roastingLogs[i].check_time}`)
    const diffMinutes = (currTime.getTime() - prevTime.getTime()) / (1000 * 60)
    if (diffMinutes > 45) {
      missedChecks.push(roastingLogs[i].check_time || '')
    }
  }

  return {
    batch_id: batchId,
    batch_no: batch.batch_no,
    expected_checks: expectedChecks,
    completed_checks: completedChecks,
    compliance_percentage: compliancePercentage,
    missed_checks: missedChecks,
    abnormal_temperatures: abnormalTemperatures,
    out_of_range_count: outOfRangeCount,
    suspicious_entries: suspiciousEntries,
  }
}

// Get Sortex hourly records for a batch
export async function getSortexHourlyRecords(batchId: string) {
  const { data, error } = await supabase
    .from('sortex_hourly_records')
    .select('*')
    .eq('batch_id', batchId)
    .order('check_time', { ascending: true })

  return { data, error }
}

// Check if value exceeds threshold and create alert if needed
export async function checkThresholdAndAlert(
  batchId: string,
  parameterName: string,
  value: number,
  thresholds: QualityAlertThreshold[]
) {
  const threshold = thresholds.find((t) => t.parameter_name === parameterName)
  if (!threshold) return null

  let alertType: 'threshold_exceeded' | null = null
  let severity: 'info' | 'warning' | 'critical' = 'info'

  if (threshold.min_value !== null && value < threshold.min_value) {
    alertType = 'threshold_exceeded'
    severity = threshold.warning_level
  } else if (threshold.max_value !== null && value > threshold.max_value) {
    alertType = 'threshold_exceeded'
    severity = threshold.warning_level
  }

  if (alertType) {
    await createQualityAlert({
      batch_id: batchId,
      alert_type: alertType,
      parameter_name: parameterName,
      value,
      threshold_min: threshold.min_value,
      threshold_max: threshold.max_value,
      severity,
      message: `${parameterName} value ${value} exceeds threshold (${threshold.min_value} - ${threshold.max_value})`,
      resolved: false,
      resolved_by: null,
      resolved_at: null,
    })
  }

  return alertType
}

// Get manager dashboard summary
export async function getManagerDashboardSummary() {
  // Get all unresolved alerts
  const { data: alerts } = await getAllUnresolvedAlerts()

  // Get batches with suspicious entries
  const { data: allBatches } = await supabase
    .from('batches')
    .select('id, batch_no, production_date, process_status')
    .order('production_date', { ascending: false })
    .limit(50)

  const batchesWithIssues: any[] = []

  if (allBatches) {
    for (const batch of allBatches) {
      const compliance = await calculateRoastingCompliance(batch.id)
      const batchAlerts = await getBatchAlerts(batch.id, false)

      if (
        compliance &&
        (compliance.compliance_percentage < 80 ||
          compliance.abnormal_temperatures > 0 ||
          compliance.suspicious_entries > 0 ||
          (batchAlerts.data && batchAlerts.data.length > 0))
      ) {
        batchesWithIssues.push({
          ...batch,
          compliance,
          alert_count: batchAlerts.data?.length || 0,
        })
      }
    }
  }

  return {
    unresolved_alerts: alerts || [],
    batches_with_issues: batchesWithIssues,
  }
}

// Get overall quality overview data across all batches
export async function getOverallQualityOverview() {
  // Get all incoming receipt data with batch info
  const { data: incomingData } = await supabase
    .from('incoming_receipts')
    .select('*, batches(batch_no, production_date)')
    .order('created_at', { ascending: false })
    .limit(100)

  // Get all sortex checklist data with batch info
  const { data: sortexData } = await supabase
    .from('sortex_hourly_records')
    .select('*, batches(batch_no, production_date)')
    .order('form_date, check_time', { ascending: false })
    .limit(200)

  // Get all sorting efficiency data with batch info
  const { data: sortingData } = await supabase
    .from('sorting_efficiency_forms')
    .select('*, batches(batch_no, production_date)')
    .order('created_at', { ascending: false })
    .limit(100)

  // Get all roasting temperature data with batch info
  const { data: roastingData } = await supabase
    .from('roasting_temperature_forms')
    .select('*, batches(batch_no, production_date)')
    .order('created_at', { ascending: false })
    .limit(200)

  return {
    incoming_data: incomingData || [],
    sortex_data: sortexData || [],
    sorting_data: sortingData || [],
    roasting_data: roastingData || [],
  }
}

// Get quality overview metrics for manager dashboard
export async function getQualityOverviewMetrics() {
  const today = new Date().toISOString().split('T')[0]

  // Get batches processed today
  const { data: todayBatches } = await supabase
    .from('batches')
    .select('*')
    .gte('production_date', today)
    .lte('production_date', today)

  // Get active batches (not completed)
  const { data: activeBatches } = await supabase
    .from('batches')
    .select('*')
    .neq('process_status', 'Completed')

  // Calculate average quality compliance
  const { data: allBatches } = await supabase
    .from('batches')
    .select('*')
    .order('production_date', { ascending: false })
    .limit(50)

  let totalCompliance = 0
  let complianceCount = 0
  let highestRiskBatch = null
  let lowestCompliance = 100

  if (allBatches) {
    for (const batch of allBatches) {
      const compliance = await calculateRoastingCompliance(batch.id)
      if (compliance) {
        totalCompliance += compliance.compliance_percentage
        complianceCount++
        if (compliance.compliance_percentage < lowestCompliance) {
          lowestCompliance = compliance.compliance_percentage
          highestRiskBatch = batch
        }
      }
    }
  }

  const avgCompliance = complianceCount > 0 ? Math.round(totalCompliance / complianceCount) : 0

  return {
    batches_processed_today: todayBatches?.length || 0,
    active_batches: activeBatches?.length || 0,
    avg_quality_compliance: avgCompliance,
    highest_risk_batch: highestRiskBatch?.batch_no || 'N/A',
  }
}

// Get incoming material comparison data
export async function getIncomingMaterialComparison() {
  const { data: incomingData } = await supabase
    .from('incoming_receipts')
    .select('*, batches(batch_no, production_date)')
    .order('created_at', { ascending: false })
    .limit(50)

  return incomingData || []
}

// Get sortex batch progress data
export async function getSortexBatchProgress() {
  const { data: sortexData } = await supabase
    .from('sortex_hourly_records')
    .select('*, batches(batch_no, production_date)')
    .order('form_date, check_time', { ascending: false })
    .limit(200)

  return sortexData || []
}

// Get roasting temperature profile data
export async function getRoastingTemperatureProfile() {
  const { data: roastingData } = await supabase
    .from('roasting_temperature_forms')
    .select('*, batches(batch_no, production_date)')
    .order('form_date, check_time', { ascending: false })
    .limit(200)

  return roastingData || []
}
