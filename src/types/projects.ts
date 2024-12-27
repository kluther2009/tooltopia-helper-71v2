export interface Project {
  id: string;
  name: string;
  status: "planned" | "ongoing" | "completed";
  user_id?: string;
  created_at: string;
  updated_at: string;
}