import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is a placeholder - you'll want to integrate with Supabase for real authentication
    toast.info("Authentication not yet implemented");
    navigate("/");
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8">
        <div className="space-y-8 bg-card p-8 rounded-lg shadow-lg border border-border">
          <div className="space-y-2 text-center">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-2">
                Tool Inventory System
              </h2>
              <div className="h-1 w-20 bg-primary mx-auto rounded" />
            </div>
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to access your tool inventory
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}