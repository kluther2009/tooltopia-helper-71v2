import { useToolsFetch } from "./tools/useToolsFetch";
import { useToolLocation } from "./tools/useToolLocation";

export interface Tool {
  id: string;
  name: string;
  location: string;
  status: "available" | "in-use" | "maintenance" | "loaned";
  purchase_date?: string | null;
  warranty_length?: number | null;
  warranty_file_path?: string | null;
  receipt_file_path?: string | null;
  sub_location_a?: string | null;
  sub_location_b?: string | null;
  purchase_cost?: number | null;
  description?: string | null;
  loaned_to?: string | null;
  loan_date?: string | null;
}

export function useTools() {
  const { tools, fetchTools } = useToolsFetch();
  const { updateToolLocation } = useToolLocation();

  return {
    tools,
    fetchTools,
    updateToolLocation
  };
}