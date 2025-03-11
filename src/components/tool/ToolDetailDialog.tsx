
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ToolStatusIcon } from "./ToolStatusIcon";
import { format } from "date-fns";
import { Book, FileText, MapPin, Calendar, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface ToolDetailDialogProps {
  toolId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ToolDetailDialog({ toolId, open, onOpenChange }: ToolDetailDialogProps) {
  const [tool, setTool] = useState<any>(null);
  const [manual, setManual] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && toolId) {
      fetchToolDetails(toolId);
    } else {
      setTool(null);
      setManual(null);
    }
  }, [open, toolId]);

  const fetchToolDetails = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setTool(data);
      
      if (data.manual_id) {
        const { data: manualData, error: manualError } = await supabase
          .from('manuals')
          .select('*')
          .eq('id', data.manual_id)
          .single();
          
        if (!manualError) {
          setManual(manualData);
        }
      }
    } catch (error) {
      console.error('Error fetching tool details:', error);
      toast.error('Failed to load tool details');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFile = (filePath: string | null) => {
    if (!filePath) return;
    
    try {
      const cleanFilePath = filePath.replace(/^\/+/, '');
      const { data } = supabase.storage
        .from('warranty-files')
        .getPublicUrl(cleanFilePath);
      
      if (data.publicUrl) {
        window.open(data.publicUrl, '_blank');
      }
    } catch (error) {
      console.error('Error opening file:', error);
      toast.error('Failed to open file');
    }
  };

  const renderLocationHierarchy = () => {
    if (!tool) return null;
    
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{tool.location}</span>
        </div>
        {tool.sub_location_a && (
          <div className="flex items-center gap-1 ml-5">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>{tool.sub_location_a}</span>
          </div>
        )}
        {tool.sub_location_b && (
          <div className="flex items-center gap-1 ml-10">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>{tool.sub_location_b}</span>
          </div>
        )}
      </div>
    );
  };

  const formatDateOrNone = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), 'MM/dd/yyyy');
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!tool) {
    return null;
  }

  const warrantyExpiryDate = tool.purchase_date && tool.warranty_length
    ? new Date(new Date(tool.purchase_date).setMonth(new Date(tool.purchase_date).getMonth() + tool.warranty_length))
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <ToolStatusIcon status={tool.status as any} />
            <DialogTitle className="text-xl">{tool.name}</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-5">
          {/* Location Section */}
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-semibold mb-2">Location</h3>
              {renderLocationHierarchy()}
            </CardContent>
          </Card>
          
          {/* Status Section */}
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-semibold mb-2">Status</h3>
              <Badge 
                className={`
                  ${tool.status === 'available' ? 'bg-green-500' : ''}
                  ${tool.status === 'in-use' ? 'bg-red-500' : ''}
                  ${tool.status === 'maintenance' ? 'bg-yellow-500' : ''}
                  ${tool.status === 'loaned' ? 'bg-blue-500' : ''}
                `}
              >
                {tool.status}
              </Badge>
              
              {tool.status === 'loaned' && tool.loaned_to && (
                <div className="mt-2">
                  <span className="text-sm">Loaned to: <span className="font-medium">{tool.loaned_to}</span></span>
                  {tool.loan_date && (
                    <div className="text-sm">
                      Loan date: {formatDateOrNone(tool.loan_date)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Warranty & Purchase Section */}
          {(tool.purchase_date || tool.purchase_cost || tool.warranty_length) && (
            <Card>
              <CardContent className="pt-5">
                <h3 className="text-sm font-semibold mb-2">Purchase & Warranty</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tool.purchase_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Purchased: {formatDateOrNone(tool.purchase_date)}
                      </span>
                    </div>
                  )}
                  
                  {tool.purchase_cost && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Cost: ${parseFloat(tool.purchase_cost).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {tool.warranty_length && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Warranty: {tool.warranty_length} months
                      </span>
                    </div>
                  )}
                  
                  {warrantyExpiryDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Expires: {format(warrantyExpiryDate, 'MM/dd/yyyy')}
                      </span>
                    </div>
                  )}
                </div>
                
                {tool.warranty_file_path && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => handleOpenFile(tool.warranty_file_path)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Warranty Document
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Maintenance Section */}
          {(tool.maintenance_period_months || tool.last_maintenance_date) && (
            <Card>
              <CardContent className="pt-5">
                <h3 className="text-sm font-semibold mb-2">Maintenance</h3>
                <div className="space-y-2">
                  {tool.maintenance_period_months && (
                    <div className="text-sm">
                      Maintenance Interval: Every {tool.maintenance_period_months} months
                    </div>
                  )}
                  
                  {tool.last_maintenance_date && (
                    <div className="text-sm">
                      Last Maintenance: {formatDateOrNone(tool.last_maintenance_date)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Manual Section */}
          {manual && (
            <Card>
              <CardContent className="pt-5">
                <h3 className="text-sm font-semibold mb-2">Manual</h3>
                <div className="space-y-2">
                  <div className="text-sm">Make: {manual.make}</div>
                  <div className="text-sm">Model: {manual.model}</div>
                  
                  {manual.summary && (
                    <>
                      <Separator className="my-2" />
                      <div className="text-sm">{manual.summary}</div>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    onClick={() => handleOpenFile(manual.file_path)}
                  >
                    <Book className="mr-2 h-4 w-4" />
                    View Manual
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Description Section */}
          {tool.description && (
            <Card>
              <CardContent className="pt-5">
                <h3 className="text-sm font-semibold mb-2">Description</h3>
                <p className="text-sm">{tool.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
