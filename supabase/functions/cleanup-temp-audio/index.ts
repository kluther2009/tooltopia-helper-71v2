import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get expired files
    const { data: expiredFiles, error: queryError } = await supabase
      .from('temp_audio_files')
      .select('file_path')
      .lt('expires_at', new Date().toISOString())

    if (queryError) {
      throw queryError
    }

    if (expiredFiles && expiredFiles.length > 0) {
      // Delete files from storage
      const filePaths = expiredFiles.map(file => file.file_path)
      const { error: storageError } = await supabase.storage
        .from('temp-audio')
        .remove(filePaths)

      if (storageError) {
        throw storageError
      }

      // Delete records from database
      const { error: deleteError } = await supabase
        .from('temp_audio_files')
        .delete()
        .lt('expires_at', new Date().toISOString())

      if (deleteError) {
        throw deleteError
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Cleanup completed', 
        filesRemoved: expiredFiles?.length ?? 0 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})