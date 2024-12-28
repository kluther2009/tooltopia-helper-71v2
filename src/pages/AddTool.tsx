import { Layout } from "@/components/Layout";
import { AddToolForm } from "@/components/tool/AddToolForm";
import { useTools } from "@/hooks/useTools";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AddTool() {
  const { tools } = useTools();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container max-w-4xl py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Add New Tool</h1>
        </div>
        <AddToolForm />
      </div>
    </Layout>
  );
}