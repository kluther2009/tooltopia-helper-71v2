import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { WarrantyFields } from "./form/WarrantyFields"
import { FileUploadFields } from "./form/FileUploadFields"
import { useNavigate } from "react-router-dom"
import { ToolEditorState } from "@/hooks/useToolEditor"

interface EditToolFormProps {
  state: ToolEditorState;
  onStateChange: (newState: Partial<ToolEditorState>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditToolForm({ state, onStateChange, onSubmit }: EditToolFormProps) {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Tool Name</Label>
        <Input
          id="name"
          value={state.name}
          onChange={(e) => onStateChange({ name: e.target.value })}
          placeholder="Enter tool name"
          className="bg-background text-foreground"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Primary Location</Label>
        <Input
          id="location"
          value={state.location}
          onChange={(e) => onStateChange({ location: e.target.value })}
          placeholder="e.g., Workshop"
          className="bg-background text-foreground"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sub_location">Sub Location (Optional)</Label>
        <Input
          id="sub_location"
          value={state.sub_location}
          onChange={(e) => onStateChange({ sub_location: e.target.value })}
          placeholder="e.g., Cabinet A"
          className="bg-background text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specific_location">Specific Location (Optional)</Label>
        <Input
          id="specific_location"
          value={state.specific_location}
          onChange={(e) => onStateChange({ specific_location: e.target.value })}
          placeholder="e.g., Top Shelf"
          className="bg-background text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={state.status} 
          onValueChange={(value) => onStateChange({ status: value })}
        >
          <SelectTrigger className="bg-background text-foreground border-input">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-background text-foreground border-input">
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in-use">In Use</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          Update Tool
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate('/tools')} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
