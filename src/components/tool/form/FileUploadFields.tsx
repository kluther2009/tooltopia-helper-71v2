import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface Manual {
  id: string;
  make: string;
  model: string;
  file_path: string;
}

interface FileUploadFieldsProps {
  onWarrantyFileChange: (file: File | null) => void;
  onReceiptFileChange: (file: File | null) => void;
  warrantyFilePath?: string | null;
  receiptFilePath?: string | null;
  onManualSelect?: (manualId: string) => void;
}

export function FileUploadFields({
  onWarrantyFileChange,
  onReceiptFileChange,
  warrantyFilePath,
  receiptFilePath,
  onManualSelect
}: FileUploadFieldsProps) {
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [manuals, setManuals] = useState<Manual[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const getFileName = (path: string | null | undefined) => {
    if (!path) return '';
    return path.split('/').pop() || '';
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('manuals')
        .select('id, make, model, file_path')
        .or(`make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setManuals(data || []);
    } catch (error) {
      console.error('Error searching manuals:', error);
      toast.error('Failed to search manuals');
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualSelect = (manual: Manual) => {
    if (onManualSelect) {
      onManualSelect(manual.id);
      toast.success(`Manual selected: ${manual.make} ${manual.model}`);
      setIsManualDialogOpen(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="warrantyFile">Warranty Documents (Optional)</Label>
        <div className="flex flex-col gap-2">
          {warrantyFilePath && (
            <div className="text-sm text-muted-foreground">
              Current file: {getFileName(warrantyFilePath)}
            </div>
          )}
          <Input
            type="file"
            id="warrantyFile"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              onWarrantyFileChange(file);
            }}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            className="bg-background text-foreground file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="receiptFile">User Manuals (Optional)</Label>
        <div className="flex flex-col gap-2">
          {receiptFilePath && (
            <div className="text-sm text-muted-foreground">
              Current file: {getFileName(receiptFilePath)}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              type="file"
              id="receiptFile"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                onReceiptFileChange(file);
              }}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              className="bg-background text-foreground file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsManualDialogOpen(true)}
            >
              Search Manuals
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Search Manuals</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by make or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
              />
              <Button 
                onClick={handleManualSearch}
                disabled={isSearching}
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {manuals.map((manual) => (
                  <div
                    key={manual.id}
                    onClick={() => handleManualSelect(manual)}
                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-slate-100"
                  >
                    <div>
                      <div className="font-medium">{manual.make}</div>
                      <div className="text-sm text-muted-foreground">{manual.model}</div>
                    </div>
                  </div>
                ))}
                {manuals.length === 0 && searchQuery && !isSearching && (
                  <div className="text-center text-muted-foreground py-4">
                    No manuals found
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}