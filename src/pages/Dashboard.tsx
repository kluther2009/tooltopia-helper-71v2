
import { useTools } from "@/hooks/useTools";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Wrench, FolderKanban, AlertCircle } from "lucide-react";
import { ToolsOverview } from "@/components/dashboard/ToolsOverview";
import { ProjectsOverview } from "@/components/dashboard/ProjectsOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { tools, fetchTools, isLoading: toolsLoading } = useTools();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  // Fetch tools on component mount
  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTools();
    setIsRefreshing(false);
  };

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

  if (isLoadingProjects || toolsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button 
          onClick={handleRefresh}
          variant="outline"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            'Refresh Data'
          )}
        </Button>
      </div>
      
      {tools.length === 0 && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No tools found</AlertTitle>
          <AlertDescription>
            You don't have any tools in your inventory yet. 
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2"
              onClick={() => navigate('/add-tool')}
            >
              Add your first tool
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
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
