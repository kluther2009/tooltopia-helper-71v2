import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ToolCardProps {
  id: string;
  name: string;
  location: string;
  status: "available" | "in-use" | "maintenance";
  onLocationUpdate: () => void;
}

export function ToolCard({ id, name, location, status, onLocationUpdate }: ToolCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newLocation, setNewLocation] = useState(location);
  const { toast } = useToast();
  const locationParts = location.split(" > ");

  const handleUpdateLocation = async () => {
    try {
      const { error } = await supabase
        .from('tools')
        .update({ location: newLocation })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Location updated",
        description: `${name}'s location has been updated successfully.`,
      });
      
      onLocationUpdate();
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tool location.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 bg-card hover:bg-card/80 transition-colors">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Wrench className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{name}</h3>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Tool Location</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter new location"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Use &quot; {`>`} &quot; to separate location levels (e.g., Workshop {`>`} Cabinet A {`>`} Top Shelf)
                    </p>
                  </div>
                  <Button onClick={handleUpdateLocation} className="w-full">
                    Update Location
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-col gap-1">
            {locationParts.map((part, index) => (
              <p key={index} className="text-sm text-gray-400 flex items-center">
                {index > 0 && <span className="ml-2">↳</span>}
                <span className={`${index > 0 ? "ml-2" : ""}`}>{part}</span>
              </p>
            ))}
          </div>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded-full text-xs ${
              status === "available" ? "bg-green-500/20 text-green-400" :
              status === "in-use" ? "bg-blue-500/20 text-blue-400" :
              "bg-yellow-500/20 text-yellow-400"
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}