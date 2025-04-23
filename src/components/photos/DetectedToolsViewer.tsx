
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useToolManagement } from "@/hooks/useToolManagement"
import { CoordinateSystem } from "@/hooks/useToolCoordinates"
import { DetectedToolList } from "./list/DetectedToolList"
import { ImageDisplay } from "./viewers/ImageDisplay"
import { ViewerDialogFooter } from "./viewers/ViewerDialogFooter"
import { supabase } from "@/integrations/supabase/client"

interface Tool {
  label: string
  box_2d: number[]
}

interface DetectedToolsViewerProps {
  imageUrl: string
  detectedTools: Tool[]
  isOpen: boolean
  onClose: () => void
  onConfirm: (tools: Tool[]) => void
  coordinateSystem?: CoordinateSystem
}

export function DetectedToolsViewer({ 
  imageUrl, 
  detectedTools: initialDetectedTools, 
  isOpen, 
  onClose,
  onConfirm,
  coordinateSystem: providedCoordinateSystem
}: DetectedToolsViewerProps) {
  const [detectedTools, setDetectedTools] = useState<Tool[]>(initialDetectedTools)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addTool } = useToolManagement()
  const [photoLocation, setPhotoLocation] = useState({ location: "", subLocation: "" })
  const [photoId, setPhotoId] = useState<string | null>(null)
  
  const [coordinateSystem] = useState<CoordinateSystem>(providedCoordinateSystem || {
    origin: 'top-left',
    x_axis_direction: 'left-to-right',
    y_axis_direction: 'top-to-bottom'
  })

  useEffect(() => {
    if (isOpen) {
      setDetectedTools(initialDetectedTools);
      setSelectedTool(null);
      setIsEditing(false);
      fetchPhotoLocation();
    }
  }, [isOpen, initialDetectedTools]);

  // Extract photo ID from the signed URL (if available)
  const fetchPhotoLocation = async () => {
    try {
      // Try to extract the photo path from the URL
      // This assumes the URL is from Supabase storage
      const photoPath = extractPhotoPathFromUrl(imageUrl);
      
      if (photoPath) {
        // Find the photo in the database
        const { data, error } = await supabase
          .from('location_photos')
          .select('id, location, sub_location')
          .eq('file_path', photoPath)
          .single();
          
        if (data && !error) {
          setPhotoLocation({ 
            location: data.location || "", 
            subLocation: data.sub_location || "" 
          });
          setPhotoId(data.id);
          console.log("Found photo location:", data.location, data.sub_location);
          console.log("Photo ID:", data.id);
        } else {
          console.log("Could not find photo location:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching photo location:", error);
    }
  };
  
  const extractPhotoPathFromUrl = (url: string): string | null => {
    try {
      // For signed URLs, extract the path
      const match = url.match(/location-photos\/([^?]+)/);
      return match ? match[1] : null;
    } catch (e) {
      console.error("Error extracting photo path:", e);
      return null;
    }
  };

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to add a tool");
        return false;
      }

      // Add the tool to the database
      const success = await addTool({
        name: tool.label,
        primaryLocation: photoLocation.location || "Detection Area",
        subLocation: photoLocation.subLocation || "",
        specificLocation: "",
        status: "available"
      });

      if (success) {
        // Get the newly created tool to get its ID for the annotation
        const { data: newTool, error: toolError } = await supabase
          .from('tools')
          .select('id')
          .eq('name', tool.label)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (toolError || !newTool) {
          console.error("Error fetching new tool ID:", toolError);
          toast.error("Tool saved but annotation could not be saved");
        } else if (photoId) {
          // Save the annotation with the tool ID and photo ID
          const coordinates = {
            x: tool.box_2d[0] / 1000, // Normalize coordinates
            y: tool.box_2d[1] / 1000,
            width: (tool.box_2d[2] - tool.box_2d[0]) / 1000,
            height: (tool.box_2d[3] - tool.box_2d[1]) / 1000
          };

          const { error: annotationError } = await supabase
            .from('tool_annotations')
            .insert({
              tool_id: newTool.id,
              photo_id: photoId,
              coordinates: coordinates,
              user_id: user.id
            });

          if (annotationError) {
            console.error("Error saving annotation:", annotationError);
            toast.error("Tool saved but annotation could not be saved");
          } else {
            console.log("Tool annotation saved successfully");
          }
        }

        toast.success(`Tool "${tool.label}" saved to your inventory`);
        
        const updatedTools = detectedTools.filter(t => t.label !== tool.label);
        setDetectedTools(updatedTools);
        setSelectedTool(null);
        setIsEditing(false);
        
        if (updatedTools.length === 0) {
          toast.success("All tools saved to inventory!");
          onClose();
        }
        
        return true;
      }
      
      return false;
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

  const handleConfirm = () => {
    onConfirm(detectedTools)
    toast.success("Tool detection data saved")
    onClose()
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedTool(null);
      setIsEditing(false);
      onClose();
    }
  };

  const updateLoadingState = (isLoading: boolean) => {
    setLoading(isLoading);
  }

  const updateErrorState = (errorMessage: string | null) => {
    setError(errorMessage);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>
            Detected Tools
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-[calc(90vh-120px)]">
          <div className="w-1/4 max-w-[250px] border-r">
            <DetectedToolList 
              tools={detectedTools}
              selectedTool={selectedTool}
              onSelectTool={handleSelectTool}
              onSaveTool={handleSaveTool}
              isEditing={isEditing}
              onRenameTool={handleRenameTool}
              onDeleteTool={handleDeleteTool}
            />
          </div>
          
          <div className="flex-1 relative">
            <ImageDisplay
              imageUrl={imageUrl}
              detectedTools={detectedTools}
              selectedTool={selectedTool}
              isEditing={isEditing}
              coordinateSystem={coordinateSystem}
              onSelectTool={handleSelectTool}
              onSaveTool={handleUpdateToolPosition}
              onCancelEdit={handleCancelEdit}
            />
          </div>
        </div>

        <ViewerDialogFooter
          loading={loading}
          error={error}
          selectedTool={selectedTool}
          isEditing={isEditing}
          onEditTool={handleEditTool}
          onClose={onClose}
          onConfirm={handleConfirm}
        />
      </DialogContent>
    </Dialog>
  )
}
