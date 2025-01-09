import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useNavigate } from "react-router-dom"

interface EditToolFormProps {
  state: {
    toolName: string;
    primaryLocation: string;
    subLocation?: string;
    specificLocation?: string;
    status: string;
    showAdditionalInfo: boolean;
  };
  onStateChange: (newState: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditToolForm({ state, onStateChange, onSubmit }: EditToolFormProps) {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="toolName">Tool Name</Label>
        <Input
          id="toolName"
          value={state.toolName}
          onChange={(e) => onStateChange({ toolName: e.target.value })}
          placeholder="Enter tool name"
          className="bg-background text-foreground"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="primaryLocation">Primary Location</Label>
        <Input
          id="primaryLocation"
          value={state.primaryLocation}
          onChange={(e) => onStateChange({ primaryLocation: e.target.value })}
          placeholder="e.g., Workshop"
          className="bg-background text-foreground"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subLocation">Sub Location (Optional)</Label>
        <Input
          id="subLocation"
          value={state.subLocation || ''}
          onChange={(e) => onStateChange({ subLocation: e.target.value })}
          placeholder="e.g., Cabinet A"
          className="bg-background text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specificLocation">Specific Location (Optional)</Label>
        <Input
          id="specificLocation"
          value={state.specificLocation || ''}
          onChange={(e) => onStateChange({ specificLocation: e.target.value })}
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