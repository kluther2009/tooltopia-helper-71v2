
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
  photoId?: string // Add photoId to access photo location data
}

export function DetectedToolsViewer({ 
  imageUrl, 
  detectedTools: initialDetectedTools, 
  isOpen, 
  onClose,
  onConfirm,
  photoId 
}: DetectedToolsViewerProps) {
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
  
  const [coordinateSystem] = useState<CoordinateSystem>({
    origin: 'top-left',
    x_axis_direction: 'left-to-right',
    y_axis_direction: 'top-to-bottom'
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
      }
    };
    
    fetchPhotoLocation();
  }, [photoId]);

  useEffect(() => {
    if (isOpen) {
      setDetectedTools(initialDetectedTools);
      setSelectedTool(null);
      setIsEditing(false);
    }
  }, [isOpen, initialDetectedTools]);

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
      // Use the photo location instead of hardcoded "Detection Area"
      const success = await addTool({
        name: tool.label,
        primaryLocation: photoLocation.location,
        subLocation: photoLocation.subLocation || "",
        specificLocation: "",
        status: "available"
      });

      if (success) {
        toast.success(`Tool "${tool.label}" saved to your inventory`);
        
        const updatedTools = detectedTools.filter(t => t.label !== tool.label);
        setDetectedTools(updatedTools);
        setSelectedTool(null);
        setIsEditing(false);
        
        if (updatedTools.length === 0) {
          toast.success("All tools saved to inventory!");
          onClose();
        }
      }
    } catch (error) {
      console.error("Error saving tool:", error);
      toast.error(`Failed to save tool "${tool.label}"`);
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
