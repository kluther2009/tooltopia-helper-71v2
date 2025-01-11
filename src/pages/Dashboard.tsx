import { useTools } from "@/hooks/useTools";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Wrench, FolderKanban } from "lucide-react";
import { ToolsOverview } from "@/components/dashboard/ToolsOverview";
import { ProjectsOverview } from "@/components/dashboard/ProjectsOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const { tools, fetchTools } = useTools();

  // Fetch tools on component mount
  useQuery({
    queryKey: ['tools'],
    queryFn: fetchTools
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  // Group tools by location for the chart
  const locationData = tools.reduce((acc: any[], tool) => {
    const location = tool.location;
    const existingLocation = acc.find(item => item.location === location);
    
    if (existingLocation) {
      existingLocation.count += 1;
    } else {
      acc.push({ location, count: 1 });
    }
    
    return acc;
  }, []);

  const toolsInUse = tools.filter(t => t.status === 'in-use').length;

  if (isLoadingProjects) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      
      <Tabs defaultValue="tools" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Tools Overview
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            Projects Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-6 animate-fade-in">
          <ToolsOverview 
            tools={tools}
            locationData={locationData}
          />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6 animate-fade-in">
          <ProjectsOverview 
            projects={projects || []}
            toolsInUse={toolsInUse}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}