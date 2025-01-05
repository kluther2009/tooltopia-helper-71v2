export interface ProjectHelperRequest {
  message: string;
  userId: string;
  projectId: string;
}

export interface ProjectData {
  name: string;
  status: string;
  target_date: string | null;
  notes: string | null;
  total_cost: number | null;
  project_tools: Array<{
    tool: {
      name: string;
      status: string;
    };
  }>;
  project_materials: Array<{
    name: string;
    quantity: number;
    cost: number;
  }>;
}

export interface Tool {
  name: string;
  location: string;
  status: string;
  purchase_date?: string;
  warranty_length?: number;
  description?: string;
}