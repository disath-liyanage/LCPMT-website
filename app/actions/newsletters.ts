"use server";

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function updateNewsletter(id: string, updateData: any) {
  const { data, error } = await supabaseAdmin
    .from('newsletters')
    .update(updateData)
    .eq('id', id)
    .select()

  if (error) throw new Error(error.message)
  return data
}
