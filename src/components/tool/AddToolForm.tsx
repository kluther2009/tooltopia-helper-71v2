import { Button } from "@/components/ui/button"
import { useState, useRef } from "react"
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

export function AddToolForm() {
  const [toolName, setToolName] = useState("")
  const [primaryLocation, setPrimaryLocation] = useState("")
  const [subLocation, setSubLocation] = useState("")
  const [specificLocation, setSpecificLocation] = useState("")
  const [status, setStatus] = useState("available")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [warrantyLength, setWarrantyLength] = useState("")
  const [purchaseCost, setPurchaseCost] = useState("")
  const [warrantyFile, setWarrantyFile] = useState<File | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  
  const navigate = useNavigate()
  const toolNameInputRef = useRef<HTMLInputElement>(null)
  const { checkToolExists } = useToolManagement()
  const { uploadFile, isUploading } = useFileUpload()

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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("You must be logged in to add a tool")
      return
    }

    try {
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
          purchase_date: purchaseDate || null,
          warranty_length: warrantyLength ? parseInt(warrantyLength) : null,
          purchase_cost: purchaseCost ? parseFloat(purchaseCost) : null
        })
        .select()
        .single()

      if (error) throw error

      // Then upload files if provided
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

      <Button type="submit" className="w-full" disabled={isUploading}>
        {isUploading ? "Uploading..." : "Add Tool"}
      </Button>
    </form>
  )
}