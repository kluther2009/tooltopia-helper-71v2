import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ProjectHelperRequest } from './types.ts'
import { 
  corsHeaders, 
  fetchProjectData, 
  fetchUserTools, 
  formatProjectDetails,
  formatToolInventory,
  getSystemPrompt
} from './utils.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

serve(async (req) => {
  console.log('Starting Project Helper function...')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Parsing request body...')
    const rawBody = await req.text()
    console.log('Raw request body:', rawBody)
    
    const parsedBody = JSON.parse(rawBody)
    console.log('Parsed body:', parsedBody)
    
    const { message, userId, projectId } = parsedBody as ProjectHelperRequest
    console.log('Received request:', { message, userId, projectId })

    if (!message || !userId || !projectId) {
      console.error('Missing required parameters:', { message, userId, projectId })
      throw new Error('Missing required parameters')
    }

    if (!ANTHROPIC_API_KEY) {
      console.error('Missing ANTHROPIC_API_KEY environment variable')
      throw new Error('Missing ANTHROPIC_API_KEY environment variable')
    }

    console.log('Fetching project and tools data...')
    const [project, tools] = await Promise.all([
      fetchProjectData(supabase, projectId),
      fetchUserTools(supabase, userId)
    ])
    
    console.log('Raw project data:', JSON.stringify(project, null, 2))
    console.log('Raw tools data:', JSON.stringify(tools, null, 2))

    const projectDetails = formatProjectDetails(project)
    const toolInventory = formatToolInventory(tools)
    const systemPrompt = getSystemPrompt(projectDetails, toolInventory)

    console.log('Formatted project details:', projectDetails)
    console.log('Formatted tool inventory:', toolInventory)
    console.log('System prompt:', systemPrompt)

    const requestBody = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: message }
      ],
    }
    
    console.log('Claude API request body:', JSON.stringify(requestBody, null, 2))
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API error:', response.status, errorText)
      throw new Error(`Claude API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log('Claude API response:', JSON.stringify(data).substring(0, 200) + '...')

    if (!data?.content?.[0]?.text) {
      console.error('Invalid Claude response format:', data)
      throw new Error('Invalid response format from Claude API')
    }

    return new Response(
      JSON.stringify({ content: [{ text: data.content[0].text }] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in project-helper function:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause: error.cause
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})