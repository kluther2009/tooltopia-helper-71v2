import { ToolListTable } from "@/components/tool/ToolListTable";

export default function ToolList() {
  return (
    <div className="max-w-[1400px] mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-card-foreground">Tool List</h1>
      <ToolListTable />
    </div>
  );
}