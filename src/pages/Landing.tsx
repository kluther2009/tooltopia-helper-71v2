import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-white">
          Welcome to ToolTracker
        </h1>
        <p className="text-xl text-slate-300">
          Organize your tools, manage projects, and keep track of your workshop inventory
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}