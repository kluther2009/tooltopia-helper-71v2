import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { BasicToolInfo } from "./form/BasicToolInfo"
import { AdditionalInfoToggle } from "./form/AdditionalInfoToggle"
import { WarrantyFields } from "./form/WarrantyFields"
import { FileUploadFields } from "./form/FileUploadFields"
import { useToolManagement } from "@/hooks/useToolManagement"
import { useToolSubmission } from "./hooks/useToolSubmission"
import { toast } from "sonner"

export function AddToolForm() {
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
  
  const toolNameInputRef = useRef<HTMLInputElement>(null)
  const { checkToolExists } = useToolManagement()
  const { handleToolSubmission, isUploading } = useToolSubmission()

  useEffect(() => {
    const annotationData = localStorage.getItem('pendingAnnotation')
    if (annotationData) {
      try {
        const data = JSON.parse(annotationData)
        setPrimaryLocation(data.location || "")
        if (data.subLocation) {
          setSubLocation(data.subLocation)
        }
      } catch (error) {
        console.error('Error parsing annotation data:', error)
        localStorage.removeItem('pendingAnnotation')
      }
    }
  }, [])

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

    await handleToolSubmission({
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
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <Button type="submit" className="w-full" disabled={isUploading}>
        {isUploading ? "Uploading..." : "Add Tool"}
      </Button>
    </form>
  )
}