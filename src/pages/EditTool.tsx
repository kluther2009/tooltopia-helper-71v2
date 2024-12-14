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
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";

export default function EditTool() {
  const [toolName, setToolName] = useState("");
  const [primaryLocation, setPrimaryLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [specificLocation, setSpecificLocation] = useState("");
  const [status, setStatus] = useState("available");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchTool = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching tool:', error);
        toast({
          title: "Error",
          description: "Failed to fetch tool details.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      if (data) {
        setToolName(data.name);
        setPrimaryLocation(data.location || '');
        setSubLocation(data.sub_location_a || '');
        setSpecificLocation(data.sub_location_b || '');
        setStatus(data.status);
      }
      setIsLoading(false);
    };

    fetchTool();
  }, [id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('tools')
      .update({
        name: toolName,
        location: primaryLocation,
        sub_location_a: subLocation || null,
        sub_location_b: specificLocation || null,
        status,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating tool:', error);
      toast({
        title: "Error",
        description: "Failed to update tool. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Tool Updated",
      description: `${toolName} has been updated successfully`,
    });
    
    navigate('/');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Edit Tool</CardTitle>
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

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Update Tool
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}