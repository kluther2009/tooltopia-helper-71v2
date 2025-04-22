
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ProjectData, Tool } from '../chat-with-project-helper/types.ts'

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

export function getSystemPrompt(projectDetails: string, toolInventory: string, taskDetails: string): string {
  return `You are a practical DIY project assistant. Focus on hands-on advice about:
- Best tools and techniques for specific tasks
- Safe and effective use of available materials
- Cost-saving suggestions and material alternatives
- Common mistakes to avoid
- Task management and sequencing recommendations
Avoid project management speak. Give direct, actionable advice.

Project:
${projectDetails}

Tasks:
${taskDetails}

Tools:
${toolInventory}`
}
