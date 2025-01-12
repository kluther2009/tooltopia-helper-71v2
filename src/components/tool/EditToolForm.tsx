import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { WarrantyFields } from "./form/WarrantyFields"
import { FileUploadFields } from "./form/FileUploadFields"
import { useNavigate, useLocation } from "react-router-dom"
import { ToolEditorState } from "@/hooks/useToolEditor"
import { useEffect, useState } from "react"

interface EditToolFormProps {
  state: ToolEditorState;
  onStateChange: (newState: Partial<ToolEditorState>) => void;
  onSubmit: (e: React.FormEvent, annotationData?: any) => Promise<void>;
}

export function EditToolForm({ state, onStateChange, onSubmit }: EditToolFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [annotationData, setAnnotationData] = useState<any>(null);

  useEffect(() => {
    const storedAnnotation = localStorage.getItem('pendingAnnotation');
    if (storedAnnotation) {
      try {
        const parsed = JSON.parse(storedAnnotation);
        console.log('[EditToolForm] Loaded annotation data:', parsed);
        setAnnotationData(parsed);
      } catch (error) {
        console.error('[EditToolForm] Error parsing annotation data:', error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('[EditToolForm] Starting form submission');
    console.log('[EditToolForm] Submitting with annotation data:', annotationData);
    await onSubmit(e, annotationData);
  };

  const handleCancel = () => {
    // Get the previous path from the location state, default to tool-overview if not set
    const previousPath = location.state?.from || '/tool-overview';
    console.log('[EditToolForm] Navigating back to:', previousPath);
    navigate(previousPath);
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
          value={state.subLocation}
          onChange={(e) => onStateChange({ subLocation: e.target.value })}
          placeholder="e.g., Cabinet A"
          className="bg-background text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specificLocation">Specific Location (Optional)</Label>
        <Input
          id="specificLocation"
          value={state.specificLocation}
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

      <div className="flex items-center space-x-2">
        <Switch
          id="show-additional-info"
          checked={state.showAdditionalInfo}
          onCheckedChange={(checked) => onStateChange({ showAdditionalInfo: checked })}
        />
        <Label htmlFor="show-additional-info">Update purchase and warranty information</Label>
      </div>

      {state.showAdditionalInfo && (
        <>
          <WarrantyFields
            purchaseDate={state.purchaseDate}
            warrantyLength={state.warrantyLength}
            purchaseCost={state.purchaseCost}
            onPurchaseDateChange={(value) => onStateChange({ purchaseDate: value })}
            onWarrantyLengthChange={(value) => onStateChange({ warrantyLength: value })}
            onPurchaseCostChange={(value) => onStateChange({ purchaseCost: value })}
          />

          <FileUploadFields
            onWarrantyFileChange={(file) => onStateChange({ warrantyFile: file })}
            onReceiptFileChange={(file) => onStateChange({ receiptFile: file })}
          />
        </>
      )}

      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          Update Tool
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}