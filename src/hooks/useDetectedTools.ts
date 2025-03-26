
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useToolManagement } from "@/hooks/useToolManagement"
import { supabase } from "@/integrations/supabase/client"

interface Tool {
  label: string
  box_2d: number[]
}

export function useDetectedTools(initialDetectedTools: Tool[], photoId?: string) {
  const [detectedTools, setDetectedTools] = useState<Tool[]>(initialDetectedTools)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addTool } = useToolManagement()
  const [photoLocation, setPhotoLocation] = useState<{ location: string, subLocation: string | null }>({ 
    location: "Detection Area", 
    subLocation: null 
  })

  // Fetch photo location when the component mounts or photoId changes
  useEffect(() => {
    const fetchPhotoLocation = async () => {
      if (!photoId) return;
      
      try {
        const { data, error } = await supabase
          .from('location_photos')
          .select('location, sub_location')
          .eq('id', photoId)
          .single();
          
        if (error) {
          console.error('Error fetching photo location:', error);
          return;
        }
        
        if (data) {
          console.log('Found photo location data:', data);
          setPhotoLocation({
            location: data.location,
            subLocation: data.sub_location
          });
        }
      } catch (error) {
        console.error('Error in fetchPhotoLocation:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPhotoLocation();
  }, [photoId]);

  useEffect(() => {
    setDetectedTools(initialDetectedTools);
    setSelectedTool(null);
    setIsEditing(false);
  }, [initialDetectedTools]);

  const handleSelectTool = (tool: Tool) => {
    setSelectedTool(tool);
    setIsEditing(false);
  };

  const handleEditTool = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleUpdateToolPosition = (updatedTool: Tool) => {
    // Update the tool's position in the UI without saving to database
    const updatedTools = detectedTools.map(tool => 
      tool.label === updatedTool.label ? updatedTool : tool
    );
    
    setDetectedTools(updatedTools);
    setSelectedTool(updatedTool);
    setIsEditing(false);
    
    toast.success(`Updated position for "${updatedTool.label}"`);
  };

  const handleSaveTool = async (tool: Tool) => {
    try {
      if (!photoId) {
        toast.error("Cannot save annotation: Missing photo ID");
        return false;
      }

      // Prepare annotation data
      const annotationData = {
        photoId: photoId,
        coordinates: {
          x: tool.box_2d[0],
          y: tool.box_2d[1],
          width: tool.box_2d[2] - tool.box_2d[0],
          height: tool.box_2d[3] - tool.box_2d[1]
        },
        location: photoLocation.location,
        subLocation: photoLocation.subLocation
      };

      // Use the photo location instead of hardcoded "Detection Area"
      const success = await addTool({
        name: tool.label,
        primaryLocation: photoLocation.location,
        subLocation: photoLocation.subLocation || "",
        specificLocation: "",
        status: "available",
        annotationData: annotationData
      });

      if (success) {
        toast.success(`Tool "${tool.label}" saved to your inventory`);
        
        const updatedTools = detectedTools.filter(t => t.label !== tool.label);
        setDetectedTools(updatedTools);
        setSelectedTool(null);
        setIsEditing(false);
        
        if (updatedTools.length === 0) {
          toast.success("All tools saved to inventory!");
        }
      }
      
      return success;
    } catch (error) {
      console.error("Error saving tool:", error);
      toast.error(`Failed to save tool "${tool.label}"`);
      return false;
    }
  };

  const handleRenameTool = (oldLabel: string, newLabel: string) => {
    const updatedTools = detectedTools.map(tool => 
      tool.label === oldLabel ? { ...tool, label: newLabel } : tool
    );
    
    setDetectedTools(updatedTools);
    
    if (selectedTool && selectedTool.label === oldLabel) {
      setSelectedTool({ ...selectedTool, label: newLabel });
    }
    
    toast.success(`Renamed "${oldLabel}" to "${newLabel}"`);
  };

  const handleDeleteTool = (toolToDelete: Tool) => {
    const updatedTools = detectedTools.filter(tool => tool.label !== toolToDelete.label);
    setDetectedTools(updatedTools);
    
    if (selectedTool && selectedTool.label === toolToDelete.label) {
      setSelectedTool(null);
      setIsEditing(false);
    }
    
    toast.success(`Removed tool "${toolToDelete.label}"`);
  };

  return {
    detectedTools,
    selectedTool,
    isEditing,
    loading,
    error,
    photoLocation,
    handleSelectTool,
    handleEditTool,
    handleCancelEdit,
    handleUpdateToolPosition,
    handleSaveTool,
    handleRenameTool,
    handleDeleteTool
  };
}
