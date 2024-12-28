import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Material {
  id: string;
  name: string;
  quantity: number;
}

export function ProjectMaterials({ projectId }: { projectId: string }) {
  const { data: materials } = useQuery({
    queryKey: ["project-materials", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_materials")
        .select("*")
        .eq("project_id", projectId);
      if (error) throw error;
      return data as Material[];
    },
  });

  return (
    <div>
      <h4 className="text-sm font-medium text-slate-300 mb-2">Materials Needed:</h4>
      <div className="flex flex-wrap gap-2">
        {materials?.map((material) => (
          <Badge
            key={material.id}
            variant="secondary"
            className="bg-slate-700 text-slate-200"
          >
            {material.name} x{material.quantity}
          </Badge>
        ))}
        {(!materials || materials.length === 0) && (
          <span className="text-sm text-slate-400">No materials added</span>
        )}
      </div>
    </div>
  );
}