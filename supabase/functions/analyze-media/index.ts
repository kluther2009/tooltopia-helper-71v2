import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const { mediaUrl, mediaType, itemId, projectId } = await req.json()

        if (!mediaUrl) throw new Error('No media URL provided')
        if (!itemId) throw new Error('No itemId provided')
        if (!mediaType || !['photo', 'voice'].includes(mediaType)) {
            throw new Error('Invalid or missing mediaType. Must be "photo" or "voice"')
        }

        const geminiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY')
        const deepSeekKey = Deno.env.get('DEEPSEEK_API_KEY')
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        if (!geminiKey) throw new Error('GEMINI_API_KEY not found')
        if (!deepSeekKey) throw new Error('DEEPSEEK_API_KEY not found')

        const supabase = createClient(supabaseUrl, supabaseKey)

        // --- STEP 1: PERCEPTION (Gemini 1.5 Flash) ---
        console.log(`[Step 1] Calling Gemini Flash for ${mediaType} perception...`)
        const genAI = new GoogleGenerativeAI(geminiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        // Fetch media
        const mediaResponse = await fetch(mediaUrl)
        if (!mediaResponse.ok) throw new Error(`Failed to fetch media: ${mediaResponse.status}`)
        const mediaBuffer = await mediaResponse.arrayBuffer()
        const base64Media = btoa(String.fromCharCode(...new Uint8Array(mediaBuffer)))

        let rawPerception = "";
        let perceptionPrompt = "";

        if (mediaType === 'photo') {
            perceptionPrompt = "Describe this image in detail, including looking for specific text (OCR), tools, and material types. Output specific details."

            const result = await model.generateContent({
                contents: [{
                    role: "user",
                    parts: [
                        { text: perceptionPrompt },
                        { inline_data: { mime_type: "image/jpeg", data: base64Media } }
                    ]
                }]
            })
            rawPerception = result.response.text()
        } else if (mediaType === 'voice') {
            perceptionPrompt = "Transcribe this audio exactly."
            const result = await model.generateContent({
                contents: [{
                    role: "user",
                    parts: [
                        { text: perceptionPrompt },
                        { inline_data: { mime_type: "audio/mp3", data: base64Media } }
                    ]
                }]
            })
            rawPerception = result.response.text()
        }

        console.log(`[Step 1] Perception complete.`)

        // --- STEP 2: COGNITION (DeepSeek V3.2) ---
        console.log(`[Step 2] Calling DeepSeek for reasoning...`)
        const deepSeekPrompt = `
    Analyze the following raw input (${mediaType}) and extract structured data for a "DIY Project Scrapbook".
    
    Raw Input:
    """
    ${rawPerception}
    """
    
    Return a JSON object with:
    - "description": A concise, useful one-sentence summary.
    - "tags": An array of relevant tags (tools, materials, room, object type).
    - "ocr_text": (If photo) The extracted text found in the image.
    - "transcription": (If voice) The cleaned up transcription.
    - "action_items": (If voice/photo text implies a task) An array of action strings.
    - "confidence": A number 0-1.

    Do not use markdown code blocks. Just return the valid JSON.
    `

        const deepSeekResponse = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${deepSeekKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are a JSON extractor for a DIY helper app." },
                    { role: "user", content: deepSeekPrompt }
                ],
                stream: false,
                response_format: { type: 'json_object' }
            })
        })

        if (!deepSeekResponse.ok) {
            const err = await deepSeekResponse.text();
            throw new Error(`DeepSeek API error: ${deepSeekResponse.status} ${err}`)
        }

        const deepSeekJson = await deepSeekResponse.json()
        let aiContent = deepSeekJson.choices[0].message.content
        aiContent = aiContent.replace(/```json\n?|\n?```/g, '').trim()
        const aiData = JSON.parse(aiContent)

        // --- STEP 3: DATABASE UPDATE ---
        console.log(`[Step 3] Updating database for item ${itemId}...`)

        // First fetch existing content to merge
        const { data: currentItem, error: fetchError } = await supabase
            .from('scrapbook_items')
            .select('content, tags')
            .eq('id', itemId)
            .single()

        if (fetchError) throw fetchError

        const newContent = {
            ...currentItem.content,
            ai_data: aiData
        }

        const existingTags = currentItem.tags || []
        const newTags = aiData.tags || []
        const mergedTags = [...new Set([...existingTags, ...newTags])]

        const { error: updateError } = await supabase
            .from('scrapbook_items')
            .update({
                content: newContent,
                tags: mergedTags
            })
            .eq('id', itemId)

        if (updateError) throw updateError

        return new Response(JSON.stringify({ success: true, data: aiData }), {
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
