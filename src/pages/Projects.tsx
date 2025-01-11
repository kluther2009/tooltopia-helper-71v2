import { ProjectsList } from "@/components/projects/ProjectsList";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ProjectFilter = "all" | "planned" | "ongoing" | "completed";
export type ProjectSort = "newest" | "oldest";

export default function Projects() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProjectFilter>("all");
  const [sortOrder, setSortOrder] = useState<ProjectSort>("newest");

  return (
    <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-slate-300">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter & Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-primary border-primary">
                <DropdownMenuLabel className="text-primary-foreground">Status Filter</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProjectFilter)}>
                  <DropdownMenuRadioItem value="all" className="text-primary-foreground focus:bg-orange-600 focus:text-white">All Projects</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="planned" className="text-primary-foreground focus:bg-orange-600 focus:text-white">Planned</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ongoing" className="text-primary-foreground focus:bg-orange-600 focus:text-white">Ongoing</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="completed" className="text-primary-foreground focus:bg-orange-600 focus:text-white">Completed</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator className="bg-orange-600" />
                <DropdownMenuLabel className="text-primary-foreground">Sort Order</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value) => setSortOrder(value as ProjectSort)}>
                  <DropdownMenuRadioItem value="newest" className="text-primary-foreground focus:bg-orange-600 focus:text-white">Newest First</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest" className="text-primary-foreground focus:bg-orange-600 focus:text-white">Oldest First</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
        <ProjectsList statusFilter={statusFilter} sortOrder={sortOrder} />

        <CreateProjectDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
    </div>
  );
}
