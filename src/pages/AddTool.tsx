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
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function AddTool() {
  const [toolName, setToolName] = useState("");
  const [primaryLocation, setPrimaryLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [specificLocation, setSpecificLocation] = useState("");
  const [status, setStatus] = useState("available");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fullLocation = `${primaryLocation}${subLocation ? ` > ${subLocation}` : ''}${specificLocation ? ` > ${specificLocation}` : ''}`;
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a tool.",
        variant: "destructive"
      });
      return;
    }

    console.log('Attempting to insert tool with data:', {
      name: toolName,
      location: fullLocation,
      status,
      user_id: user.id
    });

    const { data, error } = await supabase
      .from('tools')
      .insert([
        {
          name: toolName,
          location: fullLocation,
          status,
          user_id: user.id // Add the user_id here
        }
      ])
      .select();

    if (error) {
      console.error('Error inserting tool:', error);
      toast({
        title: "Error",
        description: "Failed to add tool. Please try again.",
        variant: "destructive"
      });
      return;
    }

    console.log('Tool inserted successfully:', data);
    
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
    
    // Navigate back to tools list
    navigate('/');
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