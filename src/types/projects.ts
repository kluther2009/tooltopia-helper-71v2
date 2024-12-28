export interface Project {
  id: string;
  name: string;
  status: "planned" | "ongoing" | "completed";
  notes?: string;
  target_date?: string;
  total_cost?: number;
  user_id?: string;
  created_at: string;
  updated_at: string;
}