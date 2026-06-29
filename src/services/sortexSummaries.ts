import { supabase } from '../lib/supabase'
import type { SortexDailySummary, SortexWeeklySummary } from '../types/database'

// Daily Summary Services
export async function getSortexDailySummaries(startDate?: string, endDate?: string) {
  let query = supabase
    .from('sortex_daily_summaries')
    .select('*')
    .order('date', { ascending: true })

  if (startDate) {
    query = query.gte('date', startDate)
  }
  if (endDate) {
    query = query.lte('date', endDate)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getSortexDailySummaryByDate(date: string) {
  const { data, error } = await supabase
    .from('sortex_daily_summaries')
    .select('*')
    .eq('date', date)
    .single()

  return { data, error }
}

export async function createSortexDailySummary(summary: Omit<SortexDailySummary, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('sortex_daily_summaries')
    .insert(summary)
    .select()
    .single()

  return { data, error }
}

export async function updateSortexDailySummary(id: string, updates: Partial<SortexDailySummary>) {
  const { data, error } = await supabase
    .from('sortex_daily_summaries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// Weekly Summary Services
export async function getSortexWeeklySummaries(year?: number) {
  let query = supabase
    .from('sortex_weekly_summaries')
    .select('*')
    .order('week_num', { ascending: true })

  if (year) {
    query = query.eq('year', year)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getSortexWeeklySummaryByWeek(weekNum: number, year: number) {
  const { data, error } = await supabase
    .from('sortex_weekly_summaries')
    .select('*')
    .eq('week_num', weekNum)
    .eq('year', year)
    .single()

  return { data, error }
}

export async function createSortexWeeklySummary(summary: Omit<SortexWeeklySummary, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('sortex_weekly_summaries')
    .insert(summary)
    .select()
    .single()

  return { data, error }
}

export async function updateSortexWeeklySummary(id: string, updates: Partial<SortexWeeklySummary>) {
  const { data, error } = await supabase
    .from('sortex_weekly_summaries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// Auto-calculation functions
export async function calculateDailySummary(date: string) {
  // Calculate daily averages from hourly QA checks
  const weekNum = getWeekNumber(date)

  // Fetch all hourly records for the given date
  const { data: hourlyRecords, error } = await supabase
    .from('sortex_hourly_records')
    .select('*')
    .eq('form_date', date)

  if (error || !hourlyRecords || hourlyRecords.length === 0) {
    return {
      date,
      samples_count: 0,
      avg_foreign_matter: null,
      avg_odor: null,
      avg_discolored: null,
      avg_different_variety: null,
      avg_moisture: null,
      avg_splits: null,
      avg_shrivelled: null,
      avg_live_insects: null,
      week_num: weekNum,
    }
  }

  // Calculate averages
  const calculateAvg = (field: keyof typeof hourlyRecords[0]) => {
    const values = hourlyRecords
      .map(r => r[field] as number | null)
      .filter(v => v !== null && v !== undefined)
    if (values.length === 0) return null
    return values.reduce((sum, v) => sum + v, 0) / values.length
  }

  const summary = {
    date,
    samples_count: hourlyRecords.length,
    avg_foreign_matter: calculateAvg('foreign_matter'),
    avg_odor: calculateAvg('odor'),
    avg_discolored: calculateAvg('discolored'),
    avg_different_variety: calculateAvg('different_variety'),
    avg_moisture: calculateAvg('moisture'),
    avg_splits: calculateAvg('splits'),
    avg_shrivelled: calculateAvg('shrivelled'),
    avg_live_insects: calculateAvg('live_insects'),
    week_num: weekNum,
  }

  return summary
}

export async function calculateWeeklySummary(weekNum: number, year: number) {
  // Calculate weekly averages from daily summaries
  const { data: dailySummaries, error } = await supabase
    .from('sortex_daily_summaries')
    .select('*')
    .eq('week_num', weekNum)

  if (error || !dailySummaries || dailySummaries.length === 0) {
    return {
      week_num: weekNum,
      year,
      avg_foreign_matter: null,
      avg_odor: null,
      avg_discolored: null,
      avg_different_variety: null,
      avg_moisture: null,
      avg_splits: null,
      avg_shrivelled: null,
      avg_live_insects: null,
    }
  }

  // Calculate averages from daily summaries
  const calculateAvg = (field: keyof typeof dailySummaries[0]) => {
    const values = dailySummaries
      .map(r => r[field] as number | null)
      .filter(v => v !== null && v !== undefined)
    if (values.length === 0) return null
    return values.reduce((sum, v) => sum + v, 0) / values.length
  }

  const summary = {
    week_num: weekNum,
    year,
    avg_foreign_matter: calculateAvg('avg_foreign_matter'),
    avg_odor: calculateAvg('avg_odor'),
    avg_discolored: calculateAvg('avg_discolored'),
    avg_different_variety: calculateAvg('avg_different_variety'),
    avg_moisture: calculateAvg('avg_moisture'),
    avg_splits: calculateAvg('avg_splits'),
    avg_shrivelled: calculateAvg('avg_shrivelled'),
    avg_live_insects: calculateAvg('avg_live_insects'),
  }

  return summary
}

// Function to generate daily summary for a date and save it
export async function generateDailySummary(date: string) {
  const summary = await calculateDailySummary(date)

  // Check if summary already exists
  const { data: existing } = await getSortexDailySummaryByDate(date)

  if (existing) {
    // Update existing
    return await updateSortexDailySummary(existing.id, summary)
  } else {
    // Create new
    return await createSortexDailySummary(summary)
  }
}

// Function to generate weekly summary for a week and save it
export async function generateWeeklySummary(weekNum: number, year: number) {
  const summary = await calculateWeeklySummary(weekNum, year)

  // Check if summary already exists
  const { data: existing } = await getSortexWeeklySummaryByWeek(weekNum, year)

  if (existing) {
    // Update existing
    return await updateSortexWeeklySummary(existing.id, summary)
  } else {
    // Create new
    return await createSortexWeeklySummary(summary)
  }
}

// Function to regenerate all daily summaries from hourly records
export async function regenerateAllDailySummaries() {
  // Get all unique dates from hourly records
  const { data: hourlyRecords } = await supabase
    .from('sortex_hourly_records')
    .select('form_date')

  if (!hourlyRecords) return { error: 'No hourly records found' }

  const uniqueDates = [...new Set(hourlyRecords.map(r => r.form_date).filter(Boolean))]

  const results = []
  for (const date of uniqueDates) {
    const result = await generateDailySummary(date)
    results.push({ date, result })
  }

  return { data: results }
}

// Function to regenerate all weekly summaries from daily summaries
export async function regenerateAllWeeklySummaries() {
  // Get all unique week numbers from daily summaries
  const { data: dailySummaries } = await supabase
    .from('sortex_daily_summaries')
    .select('date, week_num')

  if (!dailySummaries) return { error: 'No daily summaries found' }

  const weekGroups = new Map<number, Set<number>>()
  dailySummaries.forEach(d => {
    if (d.week_num && d.date) {
      const year = new Date(d.date).getFullYear()
      if (!weekGroups.has(d.week_num)) {
        weekGroups.set(d.week_num, new Set())
      }
      weekGroups.get(d.week_num)!.add(year)
    }
  })

  const results = []
  for (const [weekNum, years] of weekGroups) {
    for (const year of years) {
      const result = await generateWeeklySummary(weekNum, year)
      results.push({ weekNum, year, result })
    }
  }

  return { data: results }
}

// Helper function to get week number from date
function getWeekNumber(date: string): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return weekNo
}
