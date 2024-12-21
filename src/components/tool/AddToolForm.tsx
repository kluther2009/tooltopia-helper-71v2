import { Button } from "@/components/ui/button"
import { useState, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { ToolNameAutocomplete } from "@/components/ToolNameAutocomplete"
import { ToolLocationFields } from "@/components/ToolLocationFields"
import { useToolManagement } from "@/hooks/useToolManagement"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
  const { toast } = useToast()
  const navigate = useNavigate()
  const toolNameInputRef = useRef<HTMLInputElement>(null)
  const { checkToolExists, addTool } = useToolManagement()

  const uploadFile = async (file: File, toolId: string, fileType: 'warranty' | 'receipt') => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop()
    const filePath = `${toolId}/${fileType}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('warranty-files')
      .upload(filePath, file)

    if (uploadError) {
      console.error(`Error uploading ${fileType} file:`, uploadError)
      return null
    }

    return filePath
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!toolName.trim()) {
      toast({
        title: "Error",
        description: "Tool name is required",
        variant: "destructive"
      })
      toolNameInputRef.current?.focus()
      return
    }

    const toolExists = await checkToolExists(toolName)
    if (toolExists) {
      toast({
        title: "Error",
        description: "This tool already exists",
        variant: "destructive"
      })
      toolNameInputRef.current?.focus()
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a tool",
        variant: "destructive"
      })
      return
    }

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

    if (error) {
      console.error('Error adding tool:', error)
      toast({
        title: "Error",
        description: "Failed to add tool. Please try again.",
        variant: "destructive"
      })
      return
    }

    // Upload warranty and receipt files if provided
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

    toast({
      title: "Success",
      description: `${toolName} has been added to ${primaryLocation}${subLocation ? ` > ${subLocation}` : ''}${specificLocation ? ` > ${specificLocation}` : ''}`,
    })
    
    navigate('/')
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

      <div className="space-y-2">
        <Label htmlFor="purchaseDate">Purchase Date (Optional)</Label>
        <Input
          type="date"
          id="purchaseDate"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          className="bg-background text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="warrantyLength">Warranty Length in Months (Optional)</Label>
        <Input
          type="number"
          id="warrantyLength"
          value={warrantyLength}
          onChange={(e) => setWarrantyLength(e.target.value)}
          min="0"
          className="bg-background text-foreground"
          placeholder="e.g., 12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchaseCost">Purchase Cost (Optional)</Label>
        <Input
          type="number"
          id="purchaseCost"
          value={purchaseCost}
          onChange={(e) => setPurchaseCost(e.target.value)}
          step="0.01"
          min="0"
          className="bg-background text-foreground"
          placeholder="e.g., 99.99"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="warrantyFile">Warranty File (Optional)</Label>
        <Input
          type="file"
          id="warrantyFile"
          onChange={(e) => setWarrantyFile(e.target.files?.[0] || null)}
          className="bg-background text-foreground"
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="receiptFile">Receipt File (Optional)</Label>
        <Input
          type="file"
          id="receiptFile"
          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
          className="bg-background text-foreground"
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </div>

      <Button type="submit" className="w-full">
        Add Tool
      </Button>
    </form>
  )
}