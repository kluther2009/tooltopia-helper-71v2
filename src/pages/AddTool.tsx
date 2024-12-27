import { Layout } from "@/components/Layout";
import { AddToolForm } from "@/components/tool/AddToolForm";
import { useTools } from "@/hooks/useTools";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AddTool() {
  const { tools } = useTools();
  const { checkCanAddTool, isSubscribed } = useSubscription();
  const navigate = useNavigate();

  const handleBeforeSubmit = async () => {
    const canAdd = await checkCanAddTool(tools?.length ?? 0);
    if (!canAdd) {
      navigate("/settings");
      return false;
    }
    return true;
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Add New Tool</h1>
          {!isSubscribed && tools && tools.length >= 3 && (
            <Button
              variant="outline"
              onClick={() => navigate("/settings")}
              className="text-sm"
            >
              {tools.length >= 5 ? "Upgrade Required" : `${5 - tools.length} tools remaining`}
            </Button>
          )}
        </div>
        <AddToolForm onBeforeSubmit={handleBeforeSubmit} />
      </div>
    </Layout>
  );
}