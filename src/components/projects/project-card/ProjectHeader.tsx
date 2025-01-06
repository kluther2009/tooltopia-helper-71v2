import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Pencil, Trash2, Wrench } from "lucide-react";
import { format } from "date-fns";
import { Project } from "@/types/projects";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectHeaderProps {
  project: Project;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onToolsClick: () => void;
  onMaterialsClick: () => void;
}

export function ProjectHeader({ 
  project, 
  onEditClick, 
  onDeleteClick, 
  onToolsClick,
  onMaterialsClick 
}: ProjectHeaderProps) {
  const statusColors = {
    planned: "bg-blue-600 text-white",
    ongoing: "bg-orange-600 text-white",
    completed: "bg-green-600 text-white",
  };

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <Badge className={statusColors[project.status]} variant="secondary">
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          {project.target_date && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {format(new Date(project.target_date), "MMM d, yyyy")}
            </div>
          )}
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            {typeof project.total_cost === 'number' 
              ? `$${project.total_cost.toFixed(2)}`
              : '$0.00'
            }
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={onMaterialsClick}
              >
                <DollarSign className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Manage Materials</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={onToolsClick}
              >
                <Wrench className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Manage Tools</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={onEditClick}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Project</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={onDeleteClick}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Project</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}