
import { ToolEditorState } from "../useToolEditor";

export const mapToolStateToApiData = (state: ToolEditorState, toolId: string | undefined) => {
  const updateData: any = {
    name: state.toolName,
    location: state.primaryLocation,
    sub_location_a: state.subLocation || null,
    sub_location_b: state.specificLocation || null,
    status: state.status,
    loaned_to: state.loanedTo,
    loan_date: state.loanDate,
    manual_id: state.manualId,
    last_maintenance_date: state.lastMaintenanceDate,
    maintenance_period_months: state.maintenancePeriod ? parseInt(state.maintenancePeriod) : null,
  };

  if (state.showAdditionalInfo) {
    updateData.purchase_date = state.purchaseDate || null;
    updateData.warranty_length = state.warrantyLength ? parseInt(state.warrantyLength) : null;
    updateData.purchase_cost = state.purchaseCost ? parseFloat(state.purchaseCost) : null;
  } else {
    updateData.purchase_date = null;
    updateData.warranty_length = null;
    updateData.purchase_cost = null;
    updateData.warranty_file_path = null;
  }

  return updateData;
};

export const mapApiDataToToolState = (data: any) => {
  const hasAdditionalInfo = !!(data.purchase_date || data.warranty_length || data.purchase_cost);
  
  return {
    toolName: data.name,
    primaryLocation: data.location || '',
    subLocation: data.sub_location_a || '',
    specificLocation: data.sub_location_b || '',
    status: data.status,
    showAdditionalInfo: hasAdditionalInfo,
    purchaseDate: data.purchase_date || '',
    warrantyLength: data.warranty_length?.toString() || '',
    purchaseCost: data.purchase_cost?.toString() || '',
    warrantyFile: null,
    warrantyFilePath: data.warranty_file_path,
    loanedTo: data.loaned_to || null,
    loanDate: data.loan_date || null,
    manualId: data.manual_id || null,
    lastMaintenanceDate: data.last_maintenance_date || null,
    maintenancePeriod: data.maintenance_period_months?.toString() || null,
  };
};
