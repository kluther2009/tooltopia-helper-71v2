import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "react-router-dom";

interface ToolNameAutocompleteProps {
  value: string;
  onValueChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  onExistingToolSelect?: (toolId: string) => void;
}

export function ToolNameAutocomplete({ 
  value, 
  onValueChange, 
  inputRef,
  onExistingToolSelect 
}: ToolNameAutocompleteProps) {
  const [existingTool, setExistingTool] = useState(null);
  const location = useLocation();
  const annotationData = location.state?.annotationData;

  useEffect(() => {
    const checkExistingTool = async () => {
      if (!value) {
        setExistingTool(null);
        return;
      }

      const { data } = await supabase
        .from('tools')
        .select('*')
        .ilike('name', value)
        .single();

      setExistingTool(data);
    };

    checkExistingTool();
  }, [value]);

  const handleUpdateExisting = async () => {
    try {
      // Update tool location
      const { error: toolError } = await supabase
        .from('tools')
        .update({
          location: annotationData.location,
          sub_location: annotationData.subLocation
        })
        .eq('id', existingTool.id);

      if (toolError) throw toolError;

      // Delete old annotation
      await supabase
        .from('annotations')
        .delete()
        .eq('tool_id', existingTool.id);

      // Create new annotation
      const { error: annotationError } = await supabase
        .from('annotations')
        .insert([
          {
            tool_id: existingTool.id,
            photo_id: annotationData.photoId,
            coordinates: annotationData.coordinates
          }
        ]);

      if (annotationError) throw annotationError;

      window.location.href = '/tools';
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="toolName">Tool Name</Label>
      <Input
        id="toolName"
        ref={inputRef}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="Enter tool name"
        className="bg-background text-foreground"
        required
      />
      {existingTool && annotationData && (
        <div className="mt-2">
          <div className="text-yellow-500 mb-2">
            This tool already exists at {existingTool.location} > {existingTool.sub_location}. 
            You can update the existing tool or enter a different name.
          </div>
          <Button 
            type="button"
            className="w-full bg-orange-500 hover:bg-orange-600"
            onClick={handleUpdateExisting}
          >
            Update Existing Tool
          </Button>
        </div>
      )}
    </div>
  );
}
