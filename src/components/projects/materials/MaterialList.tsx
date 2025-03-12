
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { ProjectMaterial } from "./types";

interface MaterialListProps {
  materials: ProjectMaterial[];
  onDeleteMaterial: (id: string) => void;
  onEditMaterial: (material: ProjectMaterial) => void;
}

export function MaterialList({ 
  materials, 
  onDeleteMaterial, 
  onEditMaterial 
}: MaterialListProps) {
  return (
    <div className="space-y-2">
      {materials.map((material) => (
        <div
          key={material.id}
          className="flex items-center justify-between p-2 border rounded"
        >
          <div>
            <p className="font-medium">{material.name}</p>
            <p className="text-sm text-muted-foreground">
              ${material.cost.toFixed(2)} × {material.quantity}
            </p>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditMaterial(material)}
              title="Edit material"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteMaterial(material.id)}
              title="Delete material"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
