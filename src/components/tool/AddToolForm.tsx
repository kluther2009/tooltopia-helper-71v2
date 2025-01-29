import { BasicToolInfo } from "./form/BasicToolInfo"
import { AdditionalInfoToggle } from "./form/AdditionalInfoToggle"
import { WarrantyFields } from "./form/WarrantyFields"
import { FileUploadFields } from "./form/FileUploadFields"
import { FormButtons } from "./form/FormButtons"
import { BackgroundPhoto } from "./form/BackgroundPhoto"
import { MaintenanceFields } from "./form/MaintenanceFields"
import { useToolForm } from "@/hooks/useToolForm"
import { useBackgroundPhoto } from "@/hooks/useBackgroundPhoto"
import { useNavigate } from "react-router-dom"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface AddToolFormProps {
  onBeforeSubmit?: () => Promise<boolean>
}

export function AddToolForm({ onBeforeSubmit }: AddToolFormProps) {
  const { formState, handlers, toolNameInputRef } = useToolForm()
  const { backgroundPhotoUrl } = useBackgroundPhoto()
  const navigate = useNavigate()

  const handleExistingToolSelect = (toolId: string) => {
    navigate(`/edit-tool/${toolId}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onBeforeSubmit) {
      const canProceed = await onBeforeSubmit()
      if (!canProceed) return
    }
    handlers.handleSubmit(e)
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundPhoto photoUrl={backgroundPhotoUrl} />
      
      <form onSubmit={handleSubmit} className="relative z-10 space-y-6 bg-background/80 p-6 rounded-lg backdrop-blur-sm">
        <BasicToolInfo
          toolName={formState.toolName}
          primaryLocation={formState.primaryLocation}
          subLocation={formState.subLocation}
          specificLocation={formState.specificLocation}
          status={formState.status}
          loanedTo={formState.loanedTo}
          loanDate={formState.loanDate}
          toolNameInputRef={toolNameInputRef}
          onToolNameChange={handlers.setToolName}
          onPrimaryLocationChange={handlers.setPrimaryLocation}
          onSubLocationChange={handlers.setSubLocation}
          onSpecificLocationChange={handlers.setSpecificLocation}
          onStatusChange={handlers.setStatus}
          onLoanedToChange={handlers.setLoanedTo}
          onLoanDateChange={handlers.setLoanDate}
          onExistingToolSelect={handleExistingToolSelect}
        />

        <AdditionalInfoToggle
          showAdditionalInfo={formState.showAdditionalInfo}
          onToggle={handlers.setShowAdditionalInfo}
        />

        {formState.showAdditionalInfo && (
          <>
            <WarrantyFields
              purchaseDate={formState.purchaseDate}
              warrantyLength={formState.warrantyLength}
              purchaseCost={formState.purchaseCost}
              onPurchaseDateChange={handlers.setPurchaseDate}
              onWarrantyLengthChange={handlers.setWarrantyLength}
              onPurchaseCostChange={handlers.setPurchaseCost}
            />

            <FileUploadFields
              onWarrantyFileChange={handlers.setWarrantyFile}
              onReceiptFileChange={handlers.setReceiptFile}
              onManualSelect={handlers.setSelectedManual}
              selectedManual={formState.selectedManual}
            />
          </>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="show-maintenance-info"
            checked={formState.showMaintenanceInfo}
            onCheckedChange={handlers.setShowMaintenanceInfo}
          />
          <Label htmlFor="show-maintenance-info">Maintenance Schedule</Label>
        </div>

        {formState.showMaintenanceInfo && (
          <MaintenanceFields
            lastMaintenanceDate={formState.lastMaintenanceDate}
            maintenancePeriod={formState.maintenancePeriod}
            onLastMaintenanceDateChange={handlers.setLastMaintenanceDate}
            onMaintenancePeriodChange={handlers.setMaintenancePeriod}
          />
        )}

        <FormButtons 
          isUploading={formState.isUploading}
          onCancel={handlers.handleCancel}
        />
      </form>
    </div>
  )
}