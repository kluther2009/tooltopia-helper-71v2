import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Camera } from "lucide-react"

interface PhotoUploadButtonsProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  onCameraOpen: () => void
  isUploading: boolean
}

export function PhotoUploadButtons({ 
  onFileSelect, 
  onCameraOpen, 
  isUploading 
}: PhotoUploadButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => document.getElementById('photo-upload')?.click()}>
        <Upload className="h-4 w-4 mr-2" />
        Upload Photo
      </Button>
      <Button variant="outline" onClick={onCameraOpen}>
        <Camera className="h-4 w-4 mr-2" />
        Take Photo
      </Button>
      <Input
        id="photo-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelect}
        disabled={isUploading}
      />
    </div>
  )
}