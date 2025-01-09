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
  const [existingTool, setExistingTool] = useState(null)
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
          .select('*')  // Get all tool details
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

  const formatLocation = (tool: any) => {
    if (!tool) return ''
    let location = tool.location
    if (tool.sub_location_a) location += ` > ${tool.sub_location_a}`
    if (tool.sub_location_b) location += ` > ${tool.sub_location_b}`
    return location
  }

  const handleUpdateExisting = () => {
    if (!existingTool) return;

    // Get stored annotation data
    const storedAnnotation = localStorage.getItem('pendingAnnotation');
    let annotationData = null;
    try {
      if (storedAnnotation) {
        annotationData = JSON.parse(storedAnnotation);
      }
    } catch (error) {
      console.error('Error parsing annotation data:', error);
    }

    // Navigate with both tool and annotation data
    navigate(`/edit-tool/${existingTool.id}`, {
      state: {
        tool: existingTool,
        annotationData
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