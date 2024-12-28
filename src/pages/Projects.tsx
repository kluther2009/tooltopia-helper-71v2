import { Layout } from "@/components/Layout";
import { ProjectsList } from "@/components/projects/ProjectsList";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Wrench } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Projects() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch all unique tools used across projects
  const { data: projectTools } = useQuery({
    queryKey: ["project-tools-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tools")
        .select(`
          tool_id,
          tools (
            id,
            name,
            status
          )
        `)
        .not('tool_id', 'is', null);
      
      if (error) throw error;

      // Create a unique set of tools
      const uniqueTools = new Map();
      data.forEach(pt => {
        if (pt.tools) {
          uniqueTools.set(pt.tools.id, pt.tools);
        }
      });

      return Array.from(uniqueTools.values());
    },
  });

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto">
        <div className="flex gap-6">
          {/* Projects Section */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-white">My Projects</h1>
              <div className="flex gap-2">
                <Button variant="outline" className="text-slate-300">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>
            <ProjectsList />
          </div>

          {/* Tools Section */}
          <div className="w-80 shrink-0">
            <Card className="p-4 bg-slate-800 text-white sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Tools Required</h2>
              </div>
              <div className="space-y-3">
                {projectTools?.map((tool) => (
                  <div 
                    key={tool.id} 
                    className="flex items-center justify-between bg-slate-700/50 p-2 rounded-lg"
                  >
                    <span className="text-sm">{tool.name}</span>
                    <Badge 
                      variant="secondary" 
                      className={`
                        ${tool.status === 'available' ? 'bg-green-600' : ''}
                        ${tool.status === 'in-use' ? 'bg-orange-600' : ''}
                        ${tool.status === 'maintenance' ? 'bg-red-600' : ''}
                        text-white
                      `}
                    >
                      {tool.status}
                    </Badge>
                  </div>
                ))}
                {(!projectTools || projectTools.length === 0) && (
                  <div className="text-slate-400 text-sm text-center py-4">
                    No tools assigned to projects yet
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        <CreateProjectDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </Layout>
  );
}