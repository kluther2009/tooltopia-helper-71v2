import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ProjectData, Tool } from './types.ts'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export async function fetchProjectData(
  supabase: ReturnType<typeof createClient>,
  projectId: string
): Promise<ProjectData> {
  const { data: project, error } = await supabase
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

  if (error) throw error
  if (!project) throw new Error('Project not found')

  return project
}

export async function fetchUserTools(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<Tool[]> {
  const { data: tools, error } = await supabase
    .from('tools')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return tools || []
}

export function formatProjectDetails(project: ProjectData): string {
  return `
Project: ${project.name}
Status: ${project.status}
Target Date: ${project.target_date || 'Not set'}
Notes: ${project.notes || 'No notes'}
Total Cost: $${project.total_cost || '0.00'}

Assigned Tools:
${project.project_tools.map((pt) => `- ${pt.tool.name} (${pt.tool.status})`).join('\n')}

Materials:
${project.project_materials
    .map((m) => `- ${m.name}: ${m.quantity} units at $${m.cost} each (Total: $${m.quantity * m.cost})`)
    .join('\n')}
`.trim()
}

export function formatToolInventory(tools: Tool[]): string {
  return tools
    .map((tool) => {
      const location = [tool.location].filter(Boolean).join(' > ')

      return `- ${tool.name}
    Location: ${location}
    Status: ${tool.status}
    ${tool.purchase_date ? `Purchase Date: ${tool.purchase_date}` : ''}
    ${tool.warranty_length ? `Warranty: ${tool.warranty_length} months` : ''}`
    })
    .join('\n\n')
}

export function getSystemPrompt(projectDetails: string, toolInventory: string): string {
  return `You are ProjectHelper, an AI assistant specialized in helping users manage and optimize their DIY projects. You have access to their tools inventory and project details.

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

Here is the current project and tool information:

Project Details:
${projectDetails}

Available Tools:
${toolInventory}`
}