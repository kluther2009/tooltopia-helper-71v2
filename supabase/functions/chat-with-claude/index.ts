import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const systemPrompt = `You are ToolBot, the dedicated assistant for ToolTrackerHub. Your purpose is to help users with their DIY projects and tool management.

When responding:
1. Project Questions:
- First list required tools from the inventory
- Include locations for each tool
- Mention tool status (to avoid suggesting tools in maintenance)
- Add safety requirements for tools
- Suggest alternatives if needed tools aren't available

2. Tool Location Questions:
- Provide complete location hierarchy: main location → sub_location_a → sub_location_b
- Include tool status
- Mention if warranty is still valid based on purchase_date and warranty_length
- Reference any relevant tool descriptions

3. Maintenance Questions:
- Check tool status for maintenance needs
- Consider warranty period when suggesting repairs
- Reference purchase date for age-related advice

Common Response Patterns:
Tool Location: "The [tool] is in [location], specifically [sub_location_a], [sub_location_b]. Status: [status]"

Project Advice: 
"For [project], you'll need:
1. [Tool Name]
   - Location: [full location path]
   - Status: [status]
   - Safety Note: [specific safety requirement]
   [Add warranty info if relevant]"

Always:
- Focus on tools in inventory
- Emphasize safety
- Consider tool status before recommending
- Reference specific locations
- Include relevant warranty information

Here is the current tool inventory:
{toolInventory}
`

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate request body
    let body
    try {
      body = await req.json()
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
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
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Received request with message:', message, 'and userId:', userId)

    // Fetch tools with error handling
    const { data: tools, error: toolsError } = await supabase
      .from('tools')
      .select(`
        name,
        location,
        status,
        description,
        sub_location_a,
        sub_location_b,
        purchase_date,
        warranty_length
      `)
      .eq('user_id', userId)

    if (toolsError) {
      console.error('Error fetching tools:', toolsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tools' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!tools || tools.length === 0) {
      return new Response(
        JSON.stringify({
          content: [{
            text: "I don't see any tools in your inventory yet. Would you like help adding some tools?"
          }]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format tool inventory
    const toolInventory = tools.map(tool => {
      const location = [
        tool.location,
        tool.sub_location_a,
        tool.sub_location_b
      ].filter(Boolean).join(' > ')

      const warrantyInfo = tool.purchase_date && tool.warranty_length
        ? `\n    Warranty: ${tool.warranty_length} months (from ${tool.purchase_date})`
        : ''

      return [
        `- ${tool.name}`,
        `    Location: ${location}`,
        `    Status: ${tool.status}`,
        warrantyInfo,
        tool.description ? `    Description: ${tool.description}` : ''
      ].filter(Boolean).join('\n')
    }).join('\n\n')

    console.log('Formatted tool inventory sample:', toolInventory.substring(0, 200))

    // Call Claude API with error handling
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2024-01-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          { 
            role: 'assistant',
            content: systemPrompt.replace('{toolInventory}', toolInventory)
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
      return new Response(
        JSON.stringify({ error: `Claude API error: ${claudeResponse.status}` }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const data = await claudeResponse.json()
    console.log('Claude API response:', JSON.stringify(data).substring(0, 200))
    
    if (!data?.content?.[0]?.text) {
      console.error('Invalid Claude response format:', data)
      return new Response(
        JSON.stringify({ error: 'Invalid response format from Claude' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ content: [{ text: data.content[0].text }] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in chat-with-claude function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})