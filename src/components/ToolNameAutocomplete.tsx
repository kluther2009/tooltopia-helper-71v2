import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from 'react-router-dom'

interface ToolNameAutocompleteProps {
  value: string
  onValueChange: (value: string) => void
  inputRef?: React.RefObject<HTMLInputElement>
}

export function ToolNameAutocomplete({ 
  value, 
  onValueChange, 
  inputRef
}: ToolNameAutocompleteProps) {
  const navigate = useNavigate();
  const [existingTool, setExistingTool] = useState<{ id: string, name: string, location: string, sub_location_a?: string, sub_location_b?: string } | null>(null)
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
          .select('id, name, location, sub_location_a, sub_location_b')
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

  const handleUpdateExisting = () => {
    if (!existingTool) return;

    const annotationData = localStorage.getItem('pendingAnnotation');
    
    // Navigate to edit tool with both existing tool data and annotation data
    navigate(`/edit-tool/${existingTool.id}`, {
      state: {
        tool: existingTool,
        annotationData: annotationData ? JSON.parse(annotationData) : null
      }
    });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="toolName">Tool Name</Label>
      <Input
        id="toolName"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="Enter tool name..."
        className="bg-background text-foreground"
        required
        ref={inputRef}
      />
      
      {existingTool && (
        <div className="space-y-2">
          <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
            <AlertDescription>
              This tool already exists at {formatLocation(existingTool)}. You can update its location or enter a different name.
            </AlertDescription>
          </Alert>
          <Button
            variant="default"
            className="w-full"
            onClick={handleUpdateExisting}
          >
            Update Existing Tool
          </Button>
        </div>
      )}
    </div>
  )
}