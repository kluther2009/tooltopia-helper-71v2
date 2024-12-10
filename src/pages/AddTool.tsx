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
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AddTool() {
  const [toolName, setToolName] = useState("");
  const [primaryLocation, setPrimaryLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [specificLocation, setSpecificLocation] = useState("");
  const [status, setStatus] = useState("available");
  const [open, setOpen] = useState(false);
  const [tools, setTools] = useState<{ tool_name: string }[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    const { data, error } = await supabase
      .from('tools_reference')
      .select('tool_name')
      .not('tool_name', 'is', null);

    if (error) {
      console.error('Error fetching tools:', error);
      return;
    }

    setTools(data || []);
  };

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

    // First, add to tools_reference if it's a new tool
    const { data: existingTool } = await supabase
      .from('tools_reference')
      .select('tool_name')
      .eq('tool_name', toolName)
      .single();

    if (!existingTool) {
      const { error: referenceError } = await supabase
        .from('tools_reference')
        .insert([{ tool_name: toolName }]);

      if (referenceError) {
        console.error('Error adding to tools reference:', referenceError);
      }
    }

    // Then add the tool to the main tools table
    const { data, error } = await supabase
      .from('tools')
      .insert([
        {
          name: toolName,
          location: fullLocation,
          status,
          user_id: user.id
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
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {toolName
                        ? tools.find((tool) => tool.tool_name === toolName)?.tool_name
                        : "Select or enter tool name..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Search tool..." 
                        value={toolName}
                        onValueChange={setToolName}
                      />
                      <CommandEmpty>No tool found. Type to add new.</CommandEmpty>
                      <CommandGroup>
                        {tools.map((tool) => (
                          <CommandItem
                            key={tool.tool_name}
                            value={tool.tool_name}
                            onSelect={(currentValue) => {
                              setToolName(currentValue);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                toolName === tool.tool_name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {tool.tool_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
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