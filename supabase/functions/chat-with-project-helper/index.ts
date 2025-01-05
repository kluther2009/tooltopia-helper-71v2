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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, userId, projectId } = await req.json()
    console.log('Received request:', { message, userId, projectId })

    if (!message || !userId || !projectId) {
      throw new Error('Missing required parameters')
    }

    // Fetch project details
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
      .maybeSingle()

    if (projectError) {
      console.error('Error fetching project:', projectError)
      throw projectError
    }

    if (!project) {
      throw new Error('Project not found')
    }

    // Fetch all user's tools
    const { data: tools, error: toolsError } = await supabase
      .from('tools')
      .select('*')
      .eq('user_id', userId)

    if (toolsError) {
      console.error('Error fetching tools:', toolsError)
      throw toolsError
    }

    // Format project details
    const projectDetails = `
Project: ${project.name}
Status: ${project.status}
Target Date: ${project.target_date || 'Not set'}
Notes: ${project.notes || 'No notes'}
Total Cost: $${project.total_cost || '0.00'}

Assigned Tools:
${project.project_tools.map((pt: any) => `- ${pt.tool.name} (${pt.tool.status})`).join('\n')}

Materials:
${project.project_materials.map((m: any) => 
  `- ${m.name}: ${m.quantity} units at $${m.cost} each (Total: $${m.quantity * m.cost})`
).join('\n')}
    `.trim()

    // Format tool inventory
    const toolInventory = tools.map(tool => {
      const location = [
        tool.location,
        tool.sub_location_a,
        tool.sub_location_b
      ].filter(Boolean).join(' > ')

      return `- ${tool.name}
    Location: ${location}
    Status: ${tool.status}
    ${tool.purchase_date ? `Purchase Date: ${tool.purchase_date}` : ''}
    ${tool.warranty_length ? `Warranty: ${tool.warranty_length} months` : ''}`
    }).join('\n\n')

    console.log('Formatted project details:', projectDetails.substring(0, 200))
    console.log('Formatted tool inventory sample:', toolInventory.substring(0, 200))

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
        system: `You are ProjectHelper, an AI assistant specialized in helping users manage and optimize their DIY projects. You have access to their tools inventory and project details.

When responding to project-related questions:
1. Project Status Analysis:
- Review current project status and timeline
- Suggest next steps based on project phase
- Highlight any potential delays or issues

2. Resource Management:
- Check if required tools are available
- Suggest tool alternatives if needed
- Track material usage and costs
- Provide cost optimization suggestions

3. Timeline Management:
- Compare current progress with target date
- Suggest timeline adjustments if needed
- Highlight critical path activities

4. Safety and Best Practices:
- Provide relevant safety guidelines
- Suggest proper tool usage techniques
- Recommend protective equipment

Always:
- Be specific about tool and material recommendations
- Include safety considerations
- Consider project timeline and budget
- Reference specific project details
- Provide actionable advice

Here is the current project and tool information:
Project Details:
${projectDetails}

Available Tools:
${toolInventory}`,
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
    console.log('Claude API response:', JSON.stringify(data).substring(0, 200))

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in project-helper function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error
      }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})