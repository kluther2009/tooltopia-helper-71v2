import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { WarrantyFields } from "./form/WarrantyFields"
import { FileUploadFields } from "./form/FileUploadFields"
import { useNavigate, useLocation } from "react-router-dom"
import { ToolEditorState } from "@/hooks/useToolEditor"
import { useEffect, useState } from "react"
import { ToolLocationFields } from "@/components/ToolLocationFields"
import { ToolNameField } from "./form/fields/ToolNameField"
import { StatusField } from "./form/fields/StatusField"
import { LoanFields } from "./form/fields/LoanFields"
import { MaintenanceFields } from "./form/MaintenanceFields"

interface EditToolFormProps {
  state: ToolEditorState
  onStateChange: (newState: Partial<ToolEditorState>) => void
  onSubmit: (e: React.FormEvent, annotationData?: any) => Promise<void>
}

export function EditToolForm({ state, onStateChange, onSubmit }: EditToolFormProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [annotationData, setAnnotationData] = useState<any>(null)
  const [showLoanFields, setShowLoanFields] = useState(state.status === "loaned")
  const [showMaintenanceFields, setShowMaintenanceFields] = useState(false)

  useEffect(() => {
    const storedAnnotation = localStorage.getItem('pendingAnnotation')
    if (storedAnnotation) {
      try {
        const parsed = JSON.parse(storedAnnotation)
        console.log('[EditToolForm] Loaded annotation data:', parsed)
        setAnnotationData(parsed)
      } catch (error) {
        console.error('[EditToolForm] Error parsing annotation data:', error)
      }
    }
  }, [])

  useEffect(() => {
    setShowLoanFields(state.status === "loaned")
  }, [state.status])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('[EditToolForm] Starting form submission')
    console.log('[EditToolForm] Submitting with annotation data:', annotationData)
    await onSubmit(e, annotationData)
  }

  const handleCancel = () => {
    const previousPath = location.state?.from || '/tool-overview'
    console.log('[EditToolForm] Navigating back to:', previousPath)
    navigate(previousPath)
  }

  const handleManualSelect = (manualId: string | null) => {
    console.log('[EditToolForm] Manual selected:', manualId)
    onStateChange({ manualId })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ToolNameField
        toolName={state.toolName}
        onToolNameChange={(value) => onStateChange({ toolName: value })}
      />

      <ToolLocationFields
        primaryLocation={state.primaryLocation}
        subLocation={state.subLocation}
        specificLocation={state.specificLocation}
        onPrimaryLocationChange={(value) => onStateChange({ primaryLocation: value })}
        onSubLocationChange={(value) => onStateChange({ subLocation: value })}
        onSpecificLocationChange={(value) => onStateChange({ specificLocation: value })}
      />

      <StatusField
        status={state.status}
        onStatusChange={(value) => {
          onStateChange({ 
            status: value,
            ...(value !== "loaned" && { loanedTo: "", loanDate: "" })
          })
        }}
      />

      {showLoanFields && (
        <LoanFields
          loanedTo={state.loanedTo}
          loanDate={state.loanDate}
          onLoanedToChange={(value) => onStateChange({ loanedTo: value })}
          onLoanDateChange={(value) => onStateChange({ loanDate: value })}
        />
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="show-maintenance-info"
          checked={showMaintenanceFields}
          onCheckedChange={setShowMaintenanceFields}
        />
        <Label htmlFor="show-maintenance-info">Add maintenance schedule</Label>
      </div>

      {showMaintenanceFields && (
        <MaintenanceFields
          lastMaintenanceDate={state.lastMaintenanceDate || ""}
          maintenancePeriod={state.maintenancePeriod || ""}
          onLastMaintenanceDateChange={(value) => onStateChange({ lastMaintenanceDate: value })}
          onMaintenancePeriodChange={(value) => onStateChange({ maintenancePeriod: value })}
        />
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="show-additional-info"
          checked={state.showAdditionalInfo}
          onCheckedChange={(checked) => onStateChange({ showAdditionalInfo: checked })}
        />
        <Label htmlFor="show-additional-info">Update purchase and warranty information</Label>
      </div>

      {state.showAdditionalInfo && (
        <>
          <WarrantyFields
            purchaseDate={state.purchaseDate}
            warrantyLength={state.warrantyLength}
            purchaseCost={state.purchaseCost}
            onPurchaseDateChange={(value) => onStateChange({ purchaseDate: value })}
            onWarrantyLengthChange={(value) => onStateChange({ warrantyLength: value })}
            onPurchaseCostChange={(value) => onStateChange({ purchaseCost: value })}
          />

          <FileUploadFields
            warrantyFilePath={state.warrantyFilePath}
            onWarrantyFileChange={(file) => onStateChange({ warrantyFile: file })}
            onManualSelect={handleManualSelect}
            manualId={state.manualId}
          />
        </>
      )}

      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          Update Tool
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}