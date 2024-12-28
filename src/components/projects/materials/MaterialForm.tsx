import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface MaterialFormProps {
  newMaterial: {
    name: string;
    cost: string;
    quantity: string;
  };
  onMaterialChange: (field: string, value: string) => void;
  onAddMaterial: () => void;
  onCancel: () => void;
}

export function MaterialForm({ 
  newMaterial, 
  onMaterialChange, 
  onAddMaterial,
  onCancel 
}: MaterialFormProps) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-2">
        <Label>Name</Label>
        <Label>Cost ($)</Label>
        <Label>Quantity</Label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Input
          placeholder="Material name"
          value={newMaterial.name}
          onChange={(e) => onMaterialChange("name", e.target.value)}
        />
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="Cost"
          value={newMaterial.cost}
          onChange={(e) => onMaterialChange("cost", e.target.value)}
        />
        <Input
          type="number"
          min="1"
          placeholder="Quantity"
          value={newMaterial.quantity}
          onChange={(e) => onMaterialChange("quantity", e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={onAddMaterial} className="flex-1">
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}