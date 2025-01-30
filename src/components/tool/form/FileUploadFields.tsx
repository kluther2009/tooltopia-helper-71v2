import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ManualSelector } from "./fields/ManualSelector"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

interface Manual {
  id: string
  make: string
  model: string
  file_path: string
}

interface FileUploadFieldsProps {
  onWarrantyFileChange: (file: File | null) => void
  warrantyFilePath?: string | null
  onManualSelect?: (manualId: string | null) => void
  manualId?: string | null
}

export function FileUploadFields({
  onWarrantyFileChange,
  warrantyFilePath,
  onManualSelect,
  manualId
}: FileUploadFieldsProps) {
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null)

  useEffect(() => {
    const fetchManualDetails = async () => {
      if (manualId) {
        const { data, error } = await supabase
          .from('manuals')
          .select('*')
          .eq('id', manualId)
          .maybeSingle()

        if (error) {
          console.error('Error fetching manual details:', error)
        } else if (data) {
          setSelectedManual(data)
        }
      }
    }

    fetchManualDetails()
  }, [manualId])

  const getFileName = (path: string | null | undefined) => {
    if (!path) return ''
    return path.split('/').pop() || ''
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="warrantyFile">Warranty Documents (Optional)</Label>
        <div className="flex flex-col gap-2">
          {warrantyFilePath && (
            <div className="text-sm text-muted-foreground">
              Current file: {getFileName(warrantyFilePath)}
            </div>
          )}
          <Input
            type="file"
            id="warrantyFile"
            onChange={(e) => {
              const file = e.target.files?.[0] || null
              onWarrantyFileChange(file)
            }}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            className="bg-background text-foreground file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="manualField">User Manuals (Optional)</Label>
        <ManualSelector
          selectedManual={selectedManual}
          onManualSelect={onManualSelect || (() => {})}
          manualId={manualId || null}
        />
      </div>
    </>
  )
}