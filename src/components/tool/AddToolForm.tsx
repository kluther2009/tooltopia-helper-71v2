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

export function AddToolForm() {
  const [toolName, setToolName] = useState("")
  const [primaryLocation, setPrimaryLocation] = useState("")
  const [subLocation, setSubLocation] = useState("")
  const [specificLocation, setSpecificLocation] = useState("")
  const [status, setStatus] = useState("available")
  const { toast } = useToast()
  const navigate = useNavigate()
  const toolNameInputRef = useRef<HTMLInputElement>(null)
  const { checkToolExists, addTool } = useToolManagement()

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

    const success = await addTool({
      name: toolName,
      primaryLocation,
      subLocation,
      specificLocation,
      status
    })

    if (success) {
      toast({
        title: "Success",
        description: `${toolName} has been added to ${primaryLocation}${subLocation ? ` > ${subLocation}` : ''}${specificLocation ? ` > ${specificLocation}` : ''}`,
      })

      setToolName("")
      setPrimaryLocation("")
      setSubLocation("")
      setSpecificLocation("")
      setStatus("available")
      
      navigate('/')
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

      <Button type="submit" className="w-full">
        Add Tool
      </Button>
    </form>
  )
}