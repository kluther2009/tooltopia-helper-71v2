import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ToolNameAutocomplete } from "@/components/ToolNameAutocomplete"
import { ToolLocationFields } from "@/components/ToolLocationFields"
import { useToolManagement } from "@/hooks/useToolManagement"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { WarrantyFields } from "./form/WarrantyFields"
import { FileUploadFields } from "./form/FileUploadFields"
import { useFileUpload } from "@/hooks/useFileUpload"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Switch } from "@/components/ui/switch"

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
  const [pendingAnnotation, setPendingAnnotation] = useState<any>(null)
  
  const navigate = useNavigate()
  const toolNameInputRef = useRef<HTMLInputElement>(null)
  const { checkToolExists } = useToolManagement()
  const { uploadFile, isUploading } = useFileUpload()

  useEffect(() => {
    // Check for pending annotation data
    const annotationData = localStorage.getItem('pendingAnnotation')
    if (annotationData) {
      try {
        const data = JSON.parse(annotationData)
        setPendingAnnotation(data)
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

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to add a tool")
        return
      }

      // First insert the tool to get its ID
      const { data: newTool, error } = await supabase
        .from('tools')
        .insert({
          name: toolName.trim(),
          location: primaryLocation,
          sub_location_a: subLocation || null,
          sub_location_b: specificLocation || null,
          status,
          user_id: user.id,
          purchase_date: showAdditionalInfo ? purchaseDate || null : null,
          warranty_length: showAdditionalInfo && warrantyLength ? parseInt(warrantyLength) : null,
          purchase_cost: showAdditionalInfo && purchaseCost ? parseFloat(purchaseCost) : null
        })
        .select()
        .single()

      if (error) throw error

      // Handle file uploads if additional info is enabled
      if (showAdditionalInfo) {
        if (warrantyFile) {
          const warrantyPath = await uploadFile(warrantyFile, newTool.id, 'warranty')
          if (warrantyPath) {
            await supabase
              .from('tools')
              .update({ warranty_file_path: warrantyPath })
              .eq('id', newTool.id)
          }
        }

        if (receiptFile) {
          const receiptPath = await uploadFile(receiptFile, newTool.id, 'receipt')
          if (receiptPath) {
            await supabase
              .from('tools')
              .update({ receipt_file_path: receiptPath })
              .eq('id', newTool.id)
          }
        }
      }

      // If there's a pending annotation, create it
      if (pendingAnnotation && pendingAnnotation.coordinates) {
        const { error: annotationError } = await supabase
          .from('tool_annotations')
          .insert({
            photo_id: pendingAnnotation.photoId,
            tool_id: newTool.id,
            coordinates: pendingAnnotation.coordinates,
            user_id: user.id
          })

        if (annotationError) {
          console.error('Error creating annotation:', annotationError)
          toast.error('Failed to create tool annotation')
          return
        }

        // Clear the pending annotation
        localStorage.removeItem('pendingAnnotation')
        
        // Navigate back to initial inventory page
        navigate('/initial-inventory')
        return
      }

      toast.success(`${toolName} has been added to ${primaryLocation}${subLocation ? ` > ${subLocation}` : ''}${specificLocation ? ` > ${specificLocation}` : ''}`)
      navigate('/')
    } catch (error) {
      console.error('Error adding tool:', error)
      toast.error("Failed to add tool")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ToolNameAutocomplete
        value={toolName}
        onValueChange={setToolName}
        inputRef={toolNameInputRef}
      />

      <ToolLocationFields
        primaryLocation={primaryLocation}
        subLocation={subLocation}
        specificLocation={specificLocation}
        onPrimaryLocationChange={setPrimaryLocation}
        onSubLocationChange={setSubLocation}
        onSpecificLocationChange={setSpecificLocation}
      />

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="bg-background text-foreground border-input">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-background text-foreground border-input">
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in-use">In Use</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="show-additional-info"
          checked={showAdditionalInfo}
          onCheckedChange={setShowAdditionalInfo}
        />
        <Label htmlFor="show-additional-info">Add purchase and warranty information</Label>
      </div>

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