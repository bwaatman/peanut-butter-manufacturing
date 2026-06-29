import { supabase } from '../lib/supabase'
import type { RoastingTemperatureForm } from '../types/database'

export async function getRoastingTemperaturesByBatchId(batchId: string) {
  const { data, error } = await supabase
    .from('roasting_temperature_form')
    .select('*')
    .eq('batch_id', batchId)
    .order('created_at', { ascending: true })
  
  return { data, error }
}

export async function createRoastingTemperature(form: Omit<RoastingTemperatureForm, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('roasting_temperature_form')
    .insert(form)
    .select()
    .single()
  
  return { data, error }
}

export async function updateRoastingTemperature(id: string, updates: Partial<RoastingTemperatureForm>) {
  const { data, error } = await supabase
    .from('roasting_temperature_form')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export async function deleteRoastingTemperature(id: string) {
  const { error } = await supabase
    .from('roasting_temperature_form')
    .delete()
    .eq('id', id)
  
  return { error }
}
