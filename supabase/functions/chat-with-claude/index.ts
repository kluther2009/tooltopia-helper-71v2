import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, userId } = await req.json()
    console.log('Received request with message:', message, 'and userId:', userId)

    // Fetch user's tools
    const { data: tools, error: toolsError } = await supabase
      .from('tools')
      .select('*')
      .eq('user_id', userId)

    if (toolsError) {
      console.error('Error fetching tools:', toolsError)
      throw toolsError
    }

    console.log('Retrieved tools:', tools)

    // Format tool inventory for the prompt
    const toolInventory = tools.map(tool => {
      const location = [
        tool.location,
        tool.sub_location_a,
        tool.sub_location_b
      ].filter(Boolean).join(' > ')

      let warrantyInfo = ''
      if (tool.purchase_date && tool.warranty_length) {
        const purchaseDate = new Date(tool.purchase_date)
        const warrantyEnd = new Date(purchaseDate)
        warrantyEnd.setMonth(warrantyEnd.getMonth() + tool.warranty_length)
        const isWarrantyValid = warrantyEnd > new Date()
        warrantyInfo = `\n   Warranty: ${isWarrantyValid ? 'Valid' : 'Expired'} (${tool.warranty_length} months from ${tool.purchase_date})`
      }

      return `- ${tool.name}
   Location: ${location}
   Status: ${tool.status}${warrantyInfo}
   ${tool.description ? `Description: ${tool.description}` : ''}`
    }).join('\n\n')

    console.log('Formatted system prompt with inventory:', systemPrompt.replace('{toolInventory}', toolInventory))

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: systemPrompt.replace('{toolInventory}', toolInventory),
        messages: [
          { role: 'user', content: message }
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API error:', response.status, errorText)
      throw new Error(`API request failed: ${response.status}\nResponse: ${errorText}`)
    }

    const data = await response.json()
    console.log('Claude API response:', data)
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Invalid response format from Claude:', data)
      throw new Error('Invalid response format from Claude API')
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in chat-with-claude function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})