import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Layout } from "@/components/Layout"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { ToolNameAutocomplete } from "@/components/ToolNameAutocomplete"
import { ToolLocationFields } from "@/components/ToolLocationFields"

export default function AddTool() {
  const [toolName, setToolName] = useState("")
  const [primaryLocation, setPrimaryLocation] = useState("")
  const [subLocation, setSubLocation] = useState("")
  const [specificLocation, setSpecificLocation] = useState("")
  const [status, setStatus] = useState("available")
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const fullLocation = `${primaryLocation}${subLocation ? ` > ${subLocation}` : ''}${specificLocation ? ` > ${specificLocation}` : ''}`
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a tool.",
        variant: "destructive"
      })
      return
    }

    // First, add to tools_reference if it's a new tool
    const { data: existingTool } = await supabase
      .from('tools_reference')
      .select('tool_name')
      .eq('tool_name', toolName)
      .single()

    if (!existingTool) {
      const { error: referenceError } = await supabase
        .from('tools_reference')
        .insert([{ tool_name: toolName }])

      if (referenceError) {
        console.error('Error adding to tools reference:', referenceError)
      }
    }

    const { data, error } = await supabase
      .from('tools')
      .insert([
        {
          name: toolName,
          location: fullLocation,
          status,
          user_id: user.id
        }
      ])
      .select()

    if (error) {
      console.error('Error inserting tool:', error)
      toast({
        title: "Error",
        description: "Failed to add tool. Please try again.",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Tool Added",
      description: `${toolName} has been added to ${fullLocation}`,
    })

    setToolName("")
    setPrimaryLocation("")
    setSubLocation("")
    setSpecificLocation("")
    setStatus("available")
    
    navigate('/')
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Add New Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <ToolNameAutocomplete
                value={toolName}
                onValueChange={setToolName}
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}