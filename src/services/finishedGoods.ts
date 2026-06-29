import { supabase } from '../lib/supabase'
import type { FinishedGoods } from '../types/database'

export async function getFinishedGoodsByBatchId(batchId: string) {
  const { data, error } = await supabase
    .from('finished_goods')
    .select('*')
    .eq('batch_id', batchId)
    .single()
  
  return { data, error }
}

export async function createFinishedGoods(goods: Omit<FinishedGoods, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('finished_goods')
    .insert(goods)
    .select()
    .single()
  
  return { data, error }
}

export async function updateFinishedGoods(id: string, updates: Partial<FinishedGoods>) {
  const { data, error } = await supabase
    .from('finished_goods')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}
