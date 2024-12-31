const SUPABASE_URL = "https://bnwztdwbdejiubjfpigj.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud3p0ZHdiZGVqaXViamZwaWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1OTY1NTgsImV4cCI6MjA0OTE3MjU1OH0.sxCfIL5HXXQVkwOYLBXRrAj5FALgfecsFLc9vdS54yQ"

export const convertTextToSpeech = async (text: string): Promise<ArrayBuffer> => {
  console.log('Calling eleven-labs-tts with text:', text)
  
  const functionUrl = `${SUPABASE_URL}/functions/v1/eleven-labs-tts`
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    console.error('Edge function error:', response.status)
    throw new Error(`Failed to convert text to speech: ${response.statusText}`)
  }

  const audioArrayBuffer = await response.arrayBuffer()
  console.log('Received audio data size:', audioArrayBuffer.byteLength, 'bytes')
  return audioArrayBuffer
}