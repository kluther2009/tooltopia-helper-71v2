import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectTool {
  id: string;
  tool: {
    id: string;
    name: string;
  };
}

export function ProjectTools({ projectId }: { projectId: string }) {
  const { data: projectTools } = useQuery({
    queryKey: ["project-tools", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tools")
        .select(`
          id,
          tool:tools (
            id,
            name
          )
        `)
        .eq('project_id', projectId);
      
      if (error) {
        console.error("Error fetching tools:", error);
        throw error;
      }
      return (data || []) as ProjectTool[];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 1000, // Refetch every second while component is mounted
  });

  return (
    <div>
      <h4 className="text-sm font-medium text-slate-300 mb-2">Tools Required:</h4>
      <div className="flex flex-wrap gap-2">
        {projectTools && projectTools.length > 0 ? (
          projectTools.map((projectTool) => (
            projectTool.tool && (
              <Badge
                key={projectTool.id}
                variant="secondary"
                className="bg-slate-700 text-slate-200"
              >
                {projectTool.tool.name}
              </Badge>
            )
          ))
        ) : (
          <span className="text-sm text-slate-400">No tools added</span>
        )}
      </div>
    </div>
  );
}