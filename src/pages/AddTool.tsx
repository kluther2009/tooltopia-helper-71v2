import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function AddTool() {
  const [toolName, setToolName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("available");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically save the tool to your backend
    toast({
      title: "Tool Added",
      description: `${toolName} has been added to your inventory.`,
    });

    // Reset form
    setToolName("");
    setLocation("");
    setStatus("available");
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Add New Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="toolName">Tool Name</Label>
                <Input
                  id="toolName"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  placeholder="Enter tool name"
                  className="bg-card border-gray-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter storage location"
                  className="bg-card border-gray-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-card border-gray-700">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in-use">In Use</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Add Tool
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}