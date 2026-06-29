import { supabase } from '../lib/supabase'
import type { Batch, IncomingReceipt, SortingEfficiencyForm, RoastingTemperatureForm, FinishedGoods } from '../types/database'

export interface BatchTraceability {
  batch: Batch
  incomingReceipt: IncomingReceipt | null
  sortingEfficiency: SortingEfficiencyForm | null
  roastingTemperatures: RoastingTemperatureForm[]
  finishedGoods: FinishedGoods | null
}

export async function getBatchTraceability(batchId: string): Promise<BatchTraceability | null> {
  const [batchResult, receiptResult, sortingResult, roastingResult, finishedResult] = await Promise.all([
    supabase.from('batches').select('*').eq('id', batchId).single(),
    supabase.from('incoming_receipts').select('*').eq('batch_id', batchId).maybeSingle(),
    supabase.from('sorting_efficiency_form').select('*').eq('batch_id', batchId).maybeSingle(),
    supabase.from('roasting_temperature_form').select('*').eq('batch_id', batchId).order('created_at', { ascending: true }),
    supabase.from('finished_goods').select('*').eq('batch_id', batchId).maybeSingle(),
  ])

  if (batchResult.error || !batchResult.data) {
    return null
  }

  return {
    batch: batchResult.data,
    incomingReceipt: receiptResult.data || null,
    sortingEfficiency: sortingResult.data || null,
    roastingTemperatures: roastingResult.data || [],
    finishedGoods: finishedResult.data || null,
  }
}
