import { supabase } from '../lib/supabase'
import type { SortexHourlyRecord } from '../types/database'

export async function getSortexHourlyRecords(batchId: string) {
  const { data, error } = await supabase
    .from('sortex_hourly_records')
    .select('*')
    .eq('batch_id', batchId)
    .order('form_date, check_time', { ascending: true })

  return { data, error }
}

export async function createSortexHourlyRecord(record: Omit<SortexHourlyRecord, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('sortex_hourly_records')
    .insert(record)
    .select()
    .single()

  return { data, error }
}

export async function updateSortexHourlyRecord(id: string, record: Partial<SortexHourlyRecord>) {
  const { data, error } = await supabase
    .from('sortex_hourly_records')
    .update(record)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export async function deleteSortexHourlyRecord(id: string) {
  const { error } = await supabase
    .from('sortex_hourly_records')
    .delete()
    .eq('id', id)

  return { error }
}

export async function getSortexHourlyRecordById(id: string) {
  const { data, error } = await supabase
    .from('sortex_hourly_records')
    .select('*')
    .eq('id', id)
    .single()

  return { data, error }
}
