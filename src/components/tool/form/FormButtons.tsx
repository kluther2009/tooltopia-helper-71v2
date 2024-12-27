import { Button } from "@/components/ui/button"

interface FormButtonsProps {
  isUploading: boolean
  onCancel: () => void
}

export function FormButtons({ isUploading, onCancel }: FormButtonsProps) {
  return (
    <div className="flex gap-4">
      <Button type="submit" className="flex-1" disabled={isUploading}>
        {isUploading ? "Uploading..." : "Add Tool"}
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        className="flex-1"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  )
}