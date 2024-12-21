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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { WarrantyFields } from "@/components/tool/form/WarrantyFields";
import { FileUploadFields } from "@/components/tool/form/FileUploadFields";

export default function EditTool() {
  const [toolName, setToolName] = useState("");
  const [primaryLocation, setPrimaryLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [specificLocation, setSpecificLocation] = useState("");
  const [status, setStatus] = useState("available");
  const [isLoading, setIsLoading] = useState(true);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyLength, setWarrantyLength] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [warrantyFile, setWarrantyFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const checkAuthAndFetchTool = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          toast.error("Please sign in to edit tools");
          navigate('/login');
          return;
        }

        if (!id) return;

        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching tool:', error);
          toast.error("Failed to fetch tool details");
          navigate('/');
          return;
        }

        if (data) {
          setToolName(data.name);
          setPrimaryLocation(data.location || '');
          setSubLocation(data.sub_location_a || '');
          setSpecificLocation(data.sub_location_b || '');
          setStatus(data.status);
          
          // Set additional info fields if they exist
          const hasAdditionalInfo = !!(data.purchase_date || data.warranty_length || data.purchase_cost);
          setShowAdditionalInfo(hasAdditionalInfo);
          setPurchaseDate(data.purchase_date || '');
          setWarrantyLength(data.warranty_length?.toString() || '');
          setPurchaseCost(data.purchase_cost?.toString() || '');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error("An error occurred while loading the tool");
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchTool();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to update tools");
        navigate('/login');
        return;
      }

      const updateData: any = {
        name: toolName,
        location: primaryLocation,
        sub_location_a: subLocation || null,
        sub_location_b: specificLocation || null,
        status,
      };

      // Only include additional info fields if the toggle is on
      if (showAdditionalInfo) {
        updateData.purchase_date = purchaseDate || null;
        updateData.warranty_length = warrantyLength ? parseInt(warrantyLength) : null;
        updateData.purchase_cost = purchaseCost ? parseFloat(purchaseCost) : null;
      } else {
        // Clear additional info fields if toggle is off
        updateData.purchase_date = null;
        updateData.warranty_length = null;
        updateData.purchase_cost = null;
        updateData.warranty_file_path = null;
        updateData.receipt_file_path = null;
      }

      const { error } = await supabase
        .from('tools')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Handle file uploads if additional info is enabled
      if (showAdditionalInfo) {
        if (warrantyFile) {
          const warrantyPath = `warranty-files/${id}/${warrantyFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from('warranty-files')
            .upload(warrantyPath, warrantyFile);
          
          if (!uploadError) {
            await supabase
              .from('tools')
              .update({ warranty_file_path: warrantyPath })
              .eq('id', id);
          }
        }

        if (receiptFile) {
          const receiptPath = `warranty-files/${id}/${receiptFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from('warranty-files')
            .upload(receiptPath, receiptFile);
          
          if (!uploadError) {
            await supabase
              .from('tools')
              .update({ receipt_file_path: receiptPath })
              .eq('id', id);
          }
        }
      }
      
      toast.success("Tool updated successfully");
      navigate('/');
    } catch (error) {
      console.error('Error updating tool:', error);
      toast.error("Failed to update tool");
    }
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-additional-info"
                  checked={showAdditionalInfo}
                  onCheckedChange={setShowAdditionalInfo}
                />
                <Label htmlFor="show-additional-info">Update purchase and warranty information</Label>
              </div>

              {showAdditionalInfo && (
                <>
                  <WarrantyFields
                    purchaseDate={purchaseDate}
                    warrantyLength={warrantyLength}
                    purchaseCost={purchaseCost}
                    onPurchaseDateChange={setPurchaseDate}
                    onWarrantyLengthChange={setWarrantyLength}
                    onPurchaseCostChange={setPurchaseCost}
                  />

                  <FileUploadFields
                    onWarrantyFileChange={setWarrantyFile}
                    onReceiptFileChange={setReceiptFile}
                  />
                </>
              )}

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