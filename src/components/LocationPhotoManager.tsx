import { PhotoUploadButtons } from "./photos/upload/PhotoUploadButtons"
import { PhotoGrid } from "./photos/PhotoGrid"
import { PhotoViewerDialog } from "./photos/PhotoViewerDialog"
import { CameraDialog } from "./photos/CameraDialog"
import { LocationInputDialog } from "./photos/LocationInputDialog"
import { usePhotoManager } from "./photos/usePhotoManager"

export function LocationPhotoManager() {
  const {
    photos,
    selectedPhoto,
    isUploading,
    isViewerOpen,
    isLocationDialogOpen,
    locationInput,
    isCameraOpen,
    setSelectedPhoto,
    setIsViewerOpen,
    setIsLocationDialogOpen,
    setLocationInput,
    setIsCameraOpen,
    handleFileSelect,
    handleUploadConfirm,
    handleDeletePhoto,
    handleCameraCapture
  } = usePhotoManager()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Location Photos</h2>
        <PhotoUploadButtons
          onFileSelect={handleFileSelect}
          onCameraOpen={() => setIsCameraOpen(true)}
          isUploading={isUploading}
        />
      </div>

      <PhotoGrid
        photos={photos}
        onPhotoClick={(photo) => {
          setSelectedPhoto(photo)
          setIsViewerOpen(true)
        }}
        onDeleteClick={handleDeletePhoto}
      />

      <PhotoViewerDialog
        photo={selectedPhoto}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />

      <LocationInputDialog
        isOpen={isLocationDialogOpen}
        onClose={() => {
          setIsLocationDialogOpen(false)
          setLocationInput("")
        }}
        onConfirm={handleUploadConfirm}
        locationInput={locationInput}
        setLocationInput={setLocationInput}
      />

      <CameraDialog
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  )
}