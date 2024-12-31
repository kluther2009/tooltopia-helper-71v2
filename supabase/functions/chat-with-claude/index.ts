import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { corsHeaders, fetchUserTools, formatToolInventory, getSystemPrompt } from "./utils.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    let body
    try {
      body = await req.json()
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid request body format' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { message, userId } = body
    
    if (!message || !userId) {
      console.error('Missing required fields:', { message, userId })
      return new Response(
        JSON.stringify({ error: 'Missing required fields: message and userId are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
      console.error('Missing required environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const tools = await fetchUserTools(userId, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    if (!tools.length) {
      return new Response(
        JSON.stringify({
          content: [{
            text: "I don't see any tools in your inventory yet. Would you like help adding some tools?"
          }]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const toolInventory = formatToolInventory(tools)
    const systemPrompt = getSystemPrompt(toolInventory)

    console.log('Calling Claude API with system prompt length:', systemPrompt.length)

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          { 
            role: 'assistant',
            content: systemPrompt
          },
          { 
            role: 'user',
            content: message 
          }
        ],
      }),
    })

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text()
      console.error('Claude API error:', claudeResponse.status, errorText)
      throw new Error(`Claude API error: ${claudeResponse.status} ${errorText}`)
    }

    const data = await claudeResponse.json()
    console.log('Claude API response:', JSON.stringify(data).substring(0, 200))
    
    if (!data?.content?.[0]?.text) {
      console.error('Invalid Claude response format:', data)
      throw new Error('Invalid response format from Claude API')
    }

    return new Response(
      JSON.stringify({ content: [{ text: data.content[0].text }] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in chat-with-claude function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})