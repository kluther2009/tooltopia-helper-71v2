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
  const [primaryLocation, setPrimaryLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [specificLocation, setSpecificLocation] = useState("");
  const [status, setStatus] = useState("available");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const fullLocation = `${primaryLocation}${subLocation ? ` > ${subLocation}` : ''}${specificLocation ? ` > ${specificLocation}` : ''}`;
    
    toast({
      title: "Tool Added",
      description: `${toolName} has been added to ${fullLocation}`,
    });

    // Reset form
    setToolName("");
    setPrimaryLocation("");
    setSubLocation("");
    setSpecificLocation("");
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
                  className="bg-background text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryLocation">Primary Location</Label>
                <Input
                  id="primaryLocation"
                  value={primaryLocation}
                  onChange={(e) => setPrimaryLocation(e.target.value)}
                  placeholder="e.g., Workshop"
                  className="bg-background text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subLocation">Sub Location (Optional)</Label>
                <Input
                  id="subLocation"
                  value={subLocation}
                  onChange={(e) => setSubLocation(e.target.value)}
                  placeholder="e.g., Cabinet A"
                  className="bg-background text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specificLocation">Specific Location (Optional)</Label>
                <Input
                  id="specificLocation"
                  value={specificLocation}
                  onChange={(e) => setSpecificLocation(e.target.value)}
                  placeholder="e.g., Top Shelf"
                  className="bg-background text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-background text-foreground border-input">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background text-foreground border-input">
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