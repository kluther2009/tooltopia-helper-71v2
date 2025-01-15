import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { fetchProjectData, fetchUserTools, formatProjectDetails, formatToolInventory, getSystemPrompt } from '../chat-with-project-helper/utils.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

serve(async (req) => {
  console.log('Starting Deepseek Project Helper function...')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json()
    console.log('Request body:', requestBody)

    const { message, userId, projectId, tasks, conversation = [] } = requestBody
    
    if (!message || !userId || !projectId) {
      console.error('Missing required parameters:', { message, userId, projectId })
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY environment variable')
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

    // Take only the last 3 exchanges from the conversation history
    const recentConversation = conversation.slice(-3)

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...recentConversation.flatMap(entry => [
            { role: 'user', content: entry.message },
            { role: 'assistant', content: entry.response }
          ]),
          { role: 'user', content: message }
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Deepseek API error:', response.status, errorText)
      throw new Error(`Deepseek API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log('Deepseek API response:', data)

    return new Response(
      JSON.stringify({ content: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in project-helper-openai function:', error)
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