
interface ToolWarrantyInfoProps {
  purchaseCost?: number | null;
  warrantyMonthsLeft: number | null;
  isExpiring?: boolean;
}

export function ToolWarrantyInfo({ 
  purchaseCost, 
  warrantyMonthsLeft,
  isExpiring = false
}: ToolWarrantyInfoProps) {
  const hasWarrantyInfo = purchaseCost || warrantyMonthsLeft !== null;

  if (!hasWarrantyInfo) return null;

  return (
    <div className="text-sm text-gray-600 flex items-center justify-between border-t pt-2 mt-1">
      {purchaseCost && (
        <div>
          Purchase Price: ${purchaseCost.toFixed(2)}
        </div>
      )}
      {warrantyMonthsLeft !== null && (
        <div className={isExpiring ? "font-bold text-orange-700" : ""}>
          Warranty {warrantyMonthsLeft} months left
        </div>
      )}
    </div>
  );
}
