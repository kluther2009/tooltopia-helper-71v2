import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { fetchProjectData, fetchUserTools, formatProjectDetails, formatToolInventory, getSystemPrompt } from './utils.ts'

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
    const requestBody = await req.json()
    console.log('Request body:', requestBody)

    const { message, userId, projectId, tasks } = requestBody
    
    if (!message || !userId || !projectId) {
      console.error('Missing required parameters:', { message, userId, projectId })
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!ANTHROPIC_API_KEY) {
      console.error('Missing ANTHROPIC_API_KEY environment variable')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch project and tool data
    const projectData = await fetchProjectData(supabase, projectId)
    const userTools = await fetchUserTools(supabase, userId)

    // Format the data for the system prompt
    const projectDetails = formatProjectDetails(projectData)
    const toolInventory = formatToolInventory(userTools)
    const taskDetails = tasks ? formatTaskDetails(tasks) : 'No tasks available'
    const systemPrompt = getSystemPrompt(projectDetails, toolInventory, taskDetails)

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
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
      }),
    })

    console.log('Anthropic API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    console.log('Anthropic API response:', data)

    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Invalid response format from Anthropic:', data)
      return new Response(
        JSON.stringify({ error: 'Invalid response format from AI service' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ content: data.content[0].text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in project-helper function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function formatTaskDetails(tasks: any[]): string {
  return `Project Tasks:
${tasks.map(task => `
- ${task.title} (${task.status})
  Description: ${task.description || 'No description'}
  Due Date: ${task.due_date || 'No due date'}
  Materials Used: ${task.materials_used?.join(', ') || 'None'}
  Tools Used: ${task.tools_used?.join(', ') || 'None'}
`).join('\n')}`.trim()
}