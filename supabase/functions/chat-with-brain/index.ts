import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const { query, projectId } = await req.json()

        if (!query) throw new Error('No query provided')
        if (!projectId) throw new Error('No projectId provided')

        // Initialize Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Fetch context (Scrapbook items)
        // For now, we fetch all items for the project. 
        // In production, we'd want vector search or pagination.
        const { data: items, error: dbError } = await supabase
            .from('scrapbook_items')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })
            .limit(50) // Reasonable context limit

        if (dbError) throw dbError

        // Prepare Context String
        let contextString = "Here is the data from the user's project scrapbook:\n"
        items.forEach((item: any) => {
            const type = item.type
            const aiData = item.content?.ai_data || {}
            const description = aiData.description || item.content?.description || "No description"
            const text = item.content?.text || aiData.ocr_text || item.content?.transcription || ""
            const tags = [...(item.tags || []), ...(aiData.tags || [])].join(", ")

            contextString += `- [${type.toUpperCase()}] ${description}. Text/Content: "${text}". Tags: ${tags}\n`
        })

        const deepSeekKey = Deno.env.get('DEEPSEEK_API_KEY')
        if (!deepSeekKey) throw new Error('DEEPSEEK_API_KEY not found')

        // Call DeepSeek API
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${deepSeekKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat", // V3
                messages: [
                    {
                        role: "system",
                        content: `You are "The Brain", an intelligent assistant for a DIY Project. 
                    You have access to the user's scrapbook items (photos, notes, voice memos).
                    Use the provided context to answer the user's question accurately.
                    If the answer isn't in the context, use your general knowledge but mention you don't see it in the scrapbook.
                    Be helpful, concise, and focused on the project.
                    
                    Context:
                    ${contextString}`
                    },
                    { role: "user", content: query }
                ],
                stream: false
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`)
        }

        const aiResult = await response.json()
        const aiMessage = aiResult.choices[0].message.content

        return new Response(JSON.stringify({ answer: aiMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        })
    }
})
