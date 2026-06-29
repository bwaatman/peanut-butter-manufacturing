import { supabase } from '../lib/supabase'
import type { SortingEfficiencyForm } from '../types/database'

export async function getSortingEfficiencyByBatchId(batchId: string) {
  const { data, error } = await supabase
    .from('sorting_efficiency_form')
    .select('*')
    .eq('batch_id', batchId)
    .single()
  
  return { data, error }
}

export async function createSortingEfficiency(form: Omit<SortingEfficiencyForm, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('sorting_efficiency_form')
    .insert(form)
    .select()
    .single()
  
  return { data, error }
}

export async function updateSortingEfficiency(id: string, updates: Partial<SortingEfficiencyForm>) {
  const { data, error } = await supabase
    .from('sorting_efficiency_form')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}
