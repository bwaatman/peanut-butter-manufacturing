import { supabase } from '../lib/supabase'
import type { Batch } from '../types/database'

export async function getBatches() {
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export async function getBatchById(id: string) {
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('id', id)
    .single()
  
  return { data, error }
}

export async function getBatchByNo(batchNo: string) {
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('batch_no', batchNo)
    .single()
  
  return { data, error }
}

export async function createBatch(batch: Omit<Batch, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('batches')
    .insert(batch)
    .select()
    .single()
  
  return { data, error }
}

export async function updateBatch(id: string, updates: Partial<Batch>) {
  const { data, error } = await supabase
    .from('batches')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export async function deleteBatch(id: string) {
  const { error } = await supabase
    .from('batches')
    .delete()
    .eq('id', id)
  
  return { error }
}
