import { Layout } from "@/components/Layout";
import { ProjectsList } from "@/components/projects/ProjectsList";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { useState } from "react";

export default function Projects() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
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
        <CreateProjectDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </Layout>
  );
}