
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { toast } from "sonner"
import { useDetectedTools } from "@/hooks/useDetectedTools"
import { DetectedToolsContent } from "./viewers/DetectedToolsContent"
import { ViewerDialogFooter } from "./viewers/ViewerDialogFooter"

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
  photoId?: string
}

export function DetectedToolsViewer({ 
  imageUrl, 
  detectedTools: initialDetectedTools, 
  isOpen, 
  onClose,
  onConfirm,
  photoId 
}: DetectedToolsViewerProps) {
  const {
    detectedTools,
    selectedTool,
    isEditing,
    loading,
    error,
    handleSelectTool,
    handleEditTool,
    handleCancelEdit,
    handleUpdateToolPosition,
    handleSaveTool,
    handleRenameTool,
    handleDeleteTool
  } = useDetectedTools(initialDetectedTools, photoId)

  const handleConfirm = () => {
    onConfirm(detectedTools)
    toast.success("Tool detection data saved")
    onClose()
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
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
        
        <DetectedToolsContent
          imageUrl={imageUrl}
          detectedTools={detectedTools}
          selectedTool={selectedTool}
          isEditing={isEditing}
          onSelectTool={handleSelectTool}
          onSaveTool={handleUpdateToolPosition}
          onCancelEdit={handleCancelEdit}
          onRenameTool={handleRenameTool}
          onDeleteTool={handleDeleteTool}
        />

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
