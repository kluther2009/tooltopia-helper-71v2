import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

serve(async (req) => {
  console.log('Starting Project Helper function...')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Parsing request body...')
    const { message, userId, projectId } = await req.json()
    console.log('Received request:', { message, userId, projectId })

    if (!message || !userId || !projectId) {
      console.error('Missing required parameters:', { message, userId, projectId })
      throw new Error('Missing required parameters')
    }

    if (!ANTHROPIC_API_KEY) {
      console.error('Missing ANTHROPIC_API_KEY environment variable')
      throw new Error('Missing ANTHROPIC_API_KEY environment variable')
    }

    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        project_tools (
          tool:tools (*)
        ),
        project_materials (*)
      `)
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error('Error fetching project:', projectError)
      throw projectError
    }

    // Fetch user's tools
    const { data: tools, error: toolsError } = await supabase
      .from('tools')
      .select('*')
      .eq('user_id', userId)

    if (toolsError) {
      console.error('Error fetching tools:', toolsError)
      throw toolsError
    }

    const systemPrompt = `You are ProjectHelper, an AI specialized in helping users manage their DIY projects. You have access to:

Project Details:
- Name: ${project.name}
- Status: ${project.status}
- Target Date: ${project.target_date || 'Not set'}
- Notes: ${project.notes || 'No notes'}
- Total Cost: $${project.total_cost || '0.00'}

Assigned Tools:
${project.project_tools.map((pt: any) => `- ${pt.tool.name} (${pt.tool.status})`).join('\n')}

Materials:
${project.project_materials
  .map((m: any) => `- ${m.name}: ${m.quantity} units at $${m.cost} each`)
  .join('\n')}

Available Tools:
${tools.map((tool: any) => `- ${tool.name} (${tool.status})`).join('\n')}

Focus on:
1. Project timeline and status updates
2. Tool and material recommendations
3. Cost optimization
4. Safety guidelines
5. Best practices for the specific project type`

    console.log('Making request to Anthropic API...')
    const response = await fetch('https://api.anthropic.com/v1/messages', {
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
      }),
    })

    console.log('Anthropic API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', response.status, errorText)
      throw new Error(`Anthropic API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log('Anthropic API response:', data)

    return new Response(
      JSON.stringify({ content: data.content[0].text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in project-helper function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})