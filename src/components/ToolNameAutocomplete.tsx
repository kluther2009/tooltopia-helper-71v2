import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"

interface ToolNameAutocompleteProps {
  value: string
  onValueChange: (value: string) => void
  inputRef?: React.RefObject<HTMLInputElement>
  onExistingToolSelect?: (toolId: string) => void
}

export function ToolNameAutocomplete({ 
  value, 
  onValueChange, 
  inputRef,
  onExistingToolSelect 
}: ToolNameAutocompleteProps) {
  const [existingTool, setExistingTool] = useState<{ id: string, location: string, sub_location_a?: string, sub_location_b?: string } | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    const checkExistingTool = async () => {
      if (!value.trim()) {
        setExistingTool(null)
        return
      }

      setIsChecking(true)
      try {
        const { data, error } = await supabase
          .from('tools')
          .select('id, location, sub_location_a, sub_location_b')
          .ilike('name', value.trim())
          .maybeSingle()

        if (error) throw error
        setExistingTool(data)
      } catch (error) {
        console.error('Error checking tool existence:', error)
      } finally {
        setIsChecking(false)
      }
    }

    // Debounce the check to avoid too many requests
    const timeoutId = setTimeout(checkExistingTool, 500)
    return () => clearTimeout(timeoutId)
  }, [value])

  const formatLocation = (tool: typeof existingTool) => {
    if (!tool) return ''
    let location = tool.location
    if (tool.sub_location_a) location += ` > ${tool.sub_location_a}`
    if (tool.sub_location_b) location += ` > ${tool.sub_location_b}`
    return location
  }

  const handleExistingToolSelect = () => {
    if (!existingTool || !onExistingToolSelect) return

    // Get annotation data from localStorage before navigating
    const annotationData = localStorage.getItem('pendingAnnotation')
    if (annotationData) {
      console.log('Found pending annotation when selecting existing tool:', annotationData)
      // Keep the annotation data in localStorage - it will be picked up by EditTool
    }

    onExistingToolSelect(existingTool.id)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="toolName">Tool Name</Label>
      <div className="space-y-1">
        <Input
          id="toolName"
          value={value}
          onChange={(e) => onValueChange(e.target.value.slice(0, 50))}
          placeholder="Enter tool name..."
          className="bg-background text-foreground"
          required
          ref={inputRef}
          maxLength={50}
        />
        <p className="text-sm text-muted-foreground">
          {value.length}/50 characters
        </p>
      </div>
      
      {existingTool && (
        <div className="space-y-2">
          <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
            <AlertDescription>
              This tool already exists at {formatLocation(existingTool)}. You can update the existing tool or enter a different name.
            </AlertDescription>
          </Alert>
          <Button
            variant="default"
            className="w-full"
            onClick={handleExistingToolSelect}
          >
            Update Existing Tool
          </Button>
        </div>
      )}
    </div>
  )
}