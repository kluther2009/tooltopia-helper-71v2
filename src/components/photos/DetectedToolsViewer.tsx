import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useImageDimensions } from "@/hooks/useImageDimensions"
import { useToolCoordinates } from "@/hooks/useToolCoordinates"
import { ToolBoundingBox } from "./ToolBoundingBox"
import { DetectedToolList } from "./DetectedToolList"
import { BoundingBoxEditor } from "./BoundingBoxEditor"
import { useToolManagement } from "@/hooks/useToolManagement"
import { Save } from "lucide-react"
import { CoordinateSystem } from "@/hooks/useToolCoordinates"

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
}

export function DetectedToolsViewer({ 
  imageUrl, 
  detectedTools: initialDetectedTools, 
  isOpen, 
  onClose,
  onConfirm 
}: DetectedToolsViewerProps) {
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [detectedTools, setDetectedTools] = useState<Tool[]>(initialDetectedTools)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { addTool } = useToolManagement()
  
  const [coordinateSystem] = useState<CoordinateSystem>({
    origin: 'top-left',
    x_axis_direction: 'left-to-right',
    y_axis_direction: 'top-to-bottom'
  })

  useEffect(() => {
    if (isOpen) {
      setDetectedTools(initialDetectedTools);
      setSelectedTool(null);
      setIsEditing(false);
    }
  }, [isOpen, initialDetectedTools]);

  const {
    loading,
    error,
    setError,
    imageDimensions,
    displayDimensions,
    orientation,
    handleImageLoad,
    handleImageError
  } = useImageDimensions(imageRef, imageContainerRef)

  const { convertCoordinates } = useToolCoordinates({
    imageDimensions,
    displayDimensions,
    orientation,
    coordinateSystem
  })

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

  const handleSaveTool = async (tool: Tool) => {
    try {
      const success = await addTool({
        name: tool.label,
        primaryLocation: "Detection Area",
        subLocation: "",
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
            Detected Tools ({orientation?.charAt(0).toUpperCase() + orientation?.slice(1) || 'Loading'} Photo)
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
            {error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-500 p-4">
                  <p>{error}</p>
                  <p className="text-xs break-all mt-1">URL: {imageUrl}</p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full w-full rounded-md">
                <div 
                  className="relative w-full flex justify-center p-4" 
                  ref={imageContainerRef}
                >
                  <div className="relative inline-block">
                    <img 
                      id="detected-image"
                      ref={imageRef}
                      src={imageUrl}
                      alt="Tool detection"
                      className="rounded-lg shadow-sm max-w-full h-auto object-contain"
                      onLoad={handleImageLoad}
                      onError={() => {
                        handleImageError();
                        toast.error('Failed to load image');
                      }}
                    />
                    
                    {!loading && !isEditing && detectedTools.map((tool, index) => {
                      if (!tool.box_2d || tool.box_2d.length !== 4) {
                        console.error('Invalid bounding box format for tool:', tool);
                        return null;
                      }
                      
                      const isHighlighted = selectedTool ? selectedTool.label === tool.label : false;
                      const isActive = isHighlighted && !isEditing;
                      const coords = convertCoordinates(tool.box_2d);
                      
                      return (
                        <ToolBoundingBox 
                          key={index}
                          label={tool.label}
                          coords={coords}
                          isHighlighted={isHighlighted}
                          isActive={isActive}
                          onClick={() => setSelectedTool(tool)}
                        />
                      );
                    })}

                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                      </div>
                    )}

                    {selectedTool && isEditing && (
                      <BoundingBoxEditor 
                        imageRef={imageRef}
                        selectedTool={selectedTool}
                        orientation={orientation}
                        onSave={handleSaveTool}
                        onCancel={handleCancelEdit}
                        convertCoordinates={convertCoordinates}
                      />
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter className="p-4 pt-2">
          <div className="flex justify-between w-full">
            <div>
              {selectedTool && !isEditing && (
                <Button variant="outline" onClick={handleEditTool}>
                  Edit Bounding Box
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleConfirm} disabled={loading || !!error}>
                <Save className="h-4 w-4 mr-2" /> Save All
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
