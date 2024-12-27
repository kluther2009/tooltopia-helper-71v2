import { useState, useRef, useEffect } from "react"
import { BasicToolInfo } from "./form/BasicToolInfo"
import { AdditionalInfoToggle } from "./form/AdditionalInfoToggle"
import { WarrantyFields } from "./form/WarrantyFields"
import { FileUploadFields } from "./form/FileUploadFields"
import { FormButtons } from "./form/FormButtons"
import { BackgroundPhoto } from "./form/BackgroundPhoto"
import { useToolManagement } from "@/hooks/useToolManagement"
import { useToolSubmission } from "./hooks/useToolSubmission"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate, useLocation } from "react-router-dom"

export function AddToolForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [toolName, setToolName] = useState("")
  const [primaryLocation, setPrimaryLocation] = useState("")
  const [subLocation, setSubLocation] = useState("")
  const [specificLocation, setSpecificLocation] = useState("")
  const [status, setStatus] = useState("available")
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false)
  const [purchaseDate, setPurchaseDate] = useState("")
  const [warrantyLength, setWarrantyLength] = useState("")
  const [purchaseCost, setPurchaseCost] = useState("")
  const [warrantyFile, setWarrantyFile] = useState<File | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [backgroundPhotoUrl, setBackgroundPhotoUrl] = useState<string | null>(null)
  
  const toolNameInputRef = useRef<HTMLInputElement>(null)
  const { checkToolExists } = useToolManagement()
  const { handleToolSubmission, isUploading } = useToolSubmission()

  // Clear pending annotation if accessing directly from sidebar
  useEffect(() => {
    if (location.pathname === '/add-tool') {
      localStorage.removeItem('pendingAnnotation')
      setBackgroundPhotoUrl(null)
    }
  }, [location.pathname])

  useEffect(() => {
    const annotationData = localStorage.getItem('pendingAnnotation')
    if (annotationData) {
      try {
        const data = JSON.parse(annotationData)
        setPrimaryLocation(data.location || "")
        if (data.subLocation) {
          setSubLocation(data.subLocation)
        }
        if (data.photoId) {
          fetchPhotoUrl(data.photoId)
        }
      } catch (error) {
        console.error('Error parsing annotation data:', error)
        localStorage.removeItem('pendingAnnotation')
      }
    }
  }, [])

  const fetchPhotoUrl = async (photoId: string) => {
    try {
      const { data: photo } = await supabase
        .from('location_photos')
        .select('file_path')
        .eq('id', photoId)
        .single()

      if (photo) {
        const url = supabase.storage
          .from('location-photos')
          .getPublicUrl(photo.file_path).data.publicUrl
        setBackgroundPhotoUrl(url)
      }
    } catch (error) {
      console.error('Error fetching photo:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!toolName.trim()) {
      toast.error("Please enter a tool name")
      toolNameInputRef.current?.focus()
      return
    }

    const toolExists = await checkToolExists(toolName)
    if (toolExists) {
      toast.error("This tool already exists")
      toolNameInputRef.current?.focus()
      return
    }

    const success = await handleToolSubmission({
      toolName,
      primaryLocation,
      subLocation,
      specificLocation,
      status,
      showAdditionalInfo,
      purchaseDate,
      warrantyLength,
      purchaseCost,
      warrantyFile,
      receiptFile
    })

    if (success) {
      // Navigate back to the photo annotation view
      navigate('/initial-inventory')
    }
  }

  const handleCancel = () => {
    // Navigate back to the photo annotation view
    navigate('/initial-inventory')
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundPhoto photoUrl={backgroundPhotoUrl} />
      
      <form onSubmit={handleSubmit} className="relative z-10 space-y-6 bg-background/80 p-6 rounded-lg backdrop-blur-sm">
        <BasicToolInfo
          toolName={toolName}
          primaryLocation={primaryLocation}
          subLocation={subLocation}
          specificLocation={specificLocation}
          status={status}
          toolNameInputRef={toolNameInputRef}
          onToolNameChange={setToolName}
          onPrimaryLocationChange={setPrimaryLocation}
          onSubLocationChange={setSubLocation}
          onSpecificLocationChange={setSpecificLocation}
          onStatusChange={setStatus}
        />

        <AdditionalInfoToggle
          showAdditionalInfo={showAdditionalInfo}
          onToggle={setShowAdditionalInfo}
        />

        {showAdditionalInfo && (
          <>
            <WarrantyFields
              purchaseDate={purchaseDate}
              warrantyLength={warrantyLength}
              purchaseCost={purchaseCost}
              onPurchaseDateChange={setPurchaseDate}
              onWarrantyLengthChange={setWarrantyLength}
              onPurchaseCostChange={setPurchaseCost}
            />

            <FileUploadFields
              onWarrantyFileChange={setWarrantyFile}
              onReceiptFileChange={setReceiptFile}
            />
          </>
        )}

        <FormButtons 
          isUploading={isUploading}
          onCancel={handleCancel}
        />
      </form>
    </div>
  )
}