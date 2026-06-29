export type Batch = {
  id: string
  batch_no: string
  production_date: string
  product_name: string
  process_status: 'received' | 'sorting' | 'roasting' | 'finished' | 'completed'
  created_by: string | null
  created_at: string
  updated_at: string
}

export type IncomingReceipt = {
  id: string
  batch_id: string
  receipt_date: string | null
  supplier_name: string | null
  quantity_received_kg: number | null
  origin: string | null
  variety: string | null
  vehicle_reg: string | null
  received_by: string | null
  // Quality Parameters
  appearance_result: string | null
  colour_result: string | null
  moisture_content_result: string | null
  aflatoxin_result: string | null
  rancidity_result: string | null
  // Size Count Analysis
  foreign_matter_3040_result: string | null
  split_kernels_4050_result: string | null
  shrivelled_kernels_5060_result: string | null
  mouldy_kernels_6070_result: string | null
  live_insects_7080_result: string | null
  rotten_nuts_80100_result: string | null
  grade_out_percent: string | null
  // Decision
  decision: 'accept' | 'reject' | null
  remarks: string | null
  // Signatures
  reviewed_by_name: string | null
  reviewed_by_date: string | null
  approved_by_name: string | null
  approved_by_date: string | null
  created_at: string
  updated_at: string
}

export type SortingEfficiencyForm = {
  id: string
  batch_id: string
  form_date: string | null
  moisture_percent: number | null
  total_aflatoxin_ppb: number | null
  check_time: string | null
  rotten_nuts_percent: number | null
  shriveled_nuts_percent: number | null
  over_roast_nuts_percent: number | null
  non_branched_nuts_percent: number | null
  overall_sorting_efficiency: number | null
  result: 'pass' | 'fail' | null
  remarks: string | null
  analyst_name: string | null
  analyst_signature: string | null
  signed_date: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type RoastingTemperatureForm = {
  id: string
  batch_id: string
  form_date: string | null
  check_time: string | null
  temperature: number | null
  within_limit: boolean | null
  remarks: string | null
  analyst_name: string | null
  analyst_signature: string | null
  signed_date: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type FinishedGoods = {
  id: string
  batch_id: string
  finished_date: string | null
  quantity_produced_kg: number | null
  qc_result: string | null
  remarks: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
}

export type UserRole = 'admin' | 'analyst' | 'production_staff'

// Sortex Daily Summary
export type SortexDailySummary = {
  id: string
  date: string
  samples_count: number
  avg_foreign_matter: number | null
  avg_odor: number | null
  avg_discolored: number | null
  avg_different_variety: number | null
  avg_moisture: number | null
  avg_splits: number | null
  avg_shrivelled: number | null
  avg_live_insects: number | null
  week_num: number
  created_at: string
  updated_at: string
}

// Sortex Weekly Summary
export type SortexWeeklySummary = {
  id: string
  week_num: number
  year: number
  avg_foreign_matter: number | null
  avg_odor: number | null
  avg_discolored: number | null
  avg_different_variety: number | null
  avg_moisture: number | null
  avg_splits: number | null
  avg_shrivelled: number | null
  avg_live_insects: number | null
  created_at: string
  updated_at: string
}

// Quality Alert Thresholds
export type QualityAlertThreshold = {
  id: string
  parameter_name: string
  min_value: number | null
  max_value: number | null
  warning_level: 'info' | 'warning' | 'critical'
  description: string | null
  created_at: string
  updated_at: string
}

// Batch Quality Comparison Data
export type BatchComparisonData = {
  batch_id: string
  batch_no: string
  production_date: string
  moisture_content: number | null
  aflatoxin: number | null
  foreign_matter: number | null
  split_kernels: number | null
  shrivelled_kernels: number | null
  rotten_nuts: number | null
  mouldy_kernels: number | null
}

// Sortex Hourly Record for Monitoring (also used as Sortex Checklist form)
export type SortexHourlyRecord = {
  id: string
  batch_id: string
  form_date: string | null
  check_time: string | null
  moisture: number | null
  foreign_matter: number | null
  odor: number | null
  discolored: number | null
  different_variety: number | null
  splits: number | null
  shrivelled: number | null
  live_insects: number | null
  remarks: string | null
  analyst_name: string | null
  analyst_signature: string | null
  signed_date: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// Quality Alert
export type QualityAlert = {
  id: string
  batch_id: string
  alert_type: 'threshold_exceeded' | 'missed_check' | 'suspicious_entry' | 'out_of_range'
  parameter_name: string | null
  value: number | null
  threshold_min: number | null
  threshold_max: number | null
  severity: 'info' | 'warning' | 'critical'
  message: string
  resolved: boolean
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
}

// Roasting Compliance Data
export type RoastingCompliance = {
  batch_id: string
  batch_no: string
  expected_checks: number
  completed_checks: number
  compliance_percentage: number
  missed_checks: string[]
  abnormal_temperatures: number
  out_of_range_count: number
  suspicious_entries: number
}
