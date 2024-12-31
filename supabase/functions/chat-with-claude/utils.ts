import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export async function fetchUserTools(userId: string, supabaseUrl: string, supabaseKey: string) {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const { data: tools, error } = await supabase
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

  if (error) {
    console.error('Error fetching tools:', error)
    throw new Error('Failed to fetch tools data')
  }

  return tools || []
}

export function formatToolInventory(tools: any[]) {
  return tools.map(tool => {
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
}

export function getSystemPrompt(toolInventory: string) {
  return `You are ToolBot, the dedicated assistant for ToolTrackerHub. Your purpose is to help users with their DIY projects and tool management.

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
${toolInventory}`
}