
interface ToolWarrantyInfoProps {
  purchaseCost?: number | null;
  warrantyMonthsLeft: number | null;
  maintenanceMonthsLeft?: number | null;
  isExpiringWarranty?: boolean;
  isMaintenanceDue?: boolean;
}

export function ToolWarrantyInfo({ 
  purchaseCost, 
  warrantyMonthsLeft,
  maintenanceMonthsLeft,
  isExpiringWarranty = false,
  isMaintenanceDue = false
}: ToolWarrantyInfoProps) {
  const hasInfo = purchaseCost || warrantyMonthsLeft !== null || maintenanceMonthsLeft !== null;
  
  // Only highlight if warranty is expiring but not yet expired (months left > 0)
  const shouldHighlightWarranty = isExpiringWarranty && warrantyMonthsLeft !== null && warrantyMonthsLeft > 0;
  
  // Only highlight if maintenance is due soon but not overdue (months left > 0)
  const shouldHighlightMaintenance = isMaintenanceDue && maintenanceMonthsLeft !== null && maintenanceMonthsLeft > 0;

  if (!hasInfo) return null;

  return (
    <div className="text-sm text-gray-600 flex items-center justify-between border-t pt-2 mt-1">
      {purchaseCost && (
        <div>
          Purchase Price: ${purchaseCost.toFixed(2)}
        </div>
      )}
      
      <div className="flex flex-col items-end gap-1">
        {warrantyMonthsLeft !== null && (
          <div className={shouldHighlightWarranty ? "font-bold text-orange-700" : ""}>
            Warranty {warrantyMonthsLeft} months left
          </div>
        )}
        
        {maintenanceMonthsLeft !== null && (
          <div className={shouldHighlightMaintenance ? "font-bold text-blue-700" : ""}>
            Maintenance {maintenanceMonthsLeft} months left
          </div>
        )}
      </div>
    </div>
  );
}
