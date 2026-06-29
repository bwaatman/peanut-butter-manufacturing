import { supabase } from '../lib/supabase'
import type { IncomingReceipt } from '../types/database'

export async function getIncomingReceiptByBatchId(batchId: string) {
  const { data, error } = await supabase
    .from('incoming_receipts')
    .select('*')
    .eq('batch_id', batchId)
    .single()
  
  return { data, error }
}

export async function createIncomingReceipt(receipt: Omit<IncomingReceipt, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('incoming_receipts')
    .insert(receipt)
    .select()
    .single()
  
  return { data, error }
}

export async function updateIncomingReceipt(id: string, updates: Partial<IncomingReceipt>) {
  const { data, error } = await supabase
    .from('incoming_receipts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}
