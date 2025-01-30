import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
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
  manualId?: string | null;
}

export function FileUploadFields({
  onWarrantyFileChange,
  onReceiptFileChange,
  warrantyFilePath,
  receiptFilePath,
  onManualSelect,
  manualId
}: FileUploadFieldsProps) {
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false)
  const [isAddManualDialogOpen, setIsAddManualDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [manuals, setManuals] = useState<Manual[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [newManualMake, setNewManualMake] = useState("")
  const [newManualModel, setNewManualModel] = useState("")
  const [manualFile, setManualFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null)

  useEffect(() => {
    // Fetch selected manual details if manualId is provided
    const fetchManualDetails = async () => {
      if (manualId) {
        const { data, error } = await supabase
          .from('manuals')
          .select('*')
          .eq('id', manualId)
          .single()

        if (error) {
          console.error('Error fetching manual details:', error)
        } else if (data) {
          setSelectedManual(data)
        }
      }
    }

    fetchManualDetails()
  }, [manualId])

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
      setSelectedManual(manual);
      toast.success(`Manual selected: ${manual.make} ${manual.model}`);
      setIsManualDialogOpen(false);
    }
  };

  const handleAddManual = async () => {
    if (!manualFile || !newManualMake.trim() || !newManualModel.trim()) {
      toast.error('Please fill in all fields and upload a file');
      return;
    }

    setIsUploading(true);
    try {
      const timestamp = new Date().getTime();
      const fileExt = manualFile.name.split('.').pop();
      const filePath = `${timestamp}_${newManualMake}_${newManualModel}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('warranty-files')
        .upload(filePath, manualFile);

      if (uploadError) throw uploadError;

      // Add manual to database
      const { data: manual, error: dbError } = await supabase
        .from('manuals')
        .insert({
          make: newManualMake.trim(),
          model: newManualModel.trim(),
          file_path: filePath,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success('Manual added successfully');
      setIsAddManualDialogOpen(false);
      setNewManualMake('');
      setNewManualModel('');
      setManualFile(null);

      // If onManualSelect is provided, select the newly added manual
      if (onManualSelect && manual) {
        onManualSelect(manual.id);
        setSelectedManual(manual);
      }
    } catch (error) {
      console.error('Error adding manual:', error);
      toast.error('Failed to add manual');
    } finally {
      setIsUploading(false);
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
          {selectedManual ? (
            <div className="text-sm bg-muted p-2 rounded-md flex justify-between items-center">
              <span>Selected: {selectedManual.make} - {selectedManual.model}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedManual(null);
                  if (onManualSelect) onManualSelect(null);
                }}
              >
                Clear
              </Button>
            </div>
          ) : (
            receiptFilePath && (
              <div className="text-sm text-muted-foreground">
                Current file: {getFileName(receiptFilePath)}
              </div>
            )
          )}
          <div className="flex gap-2">
            <Input
              type="file"
              id="receiptFile"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                onReceiptFileChange(file);
                // Clear selected manual when uploading a file
                if (file && selectedManual) {
                  setSelectedManual(null);
                  if (onManualSelect) onManualSelect(null);
                }
              }}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              className="bg-background text-foreground file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              disabled={!!selectedManual}
            />
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsManualDialogOpen(true)}
            >
              Search Manuals
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddManualDialogOpen(true)}
            >
              Add Manual
            </Button>
          </div>
        </div>
      </div>

      {/* Search Manuals Dialog */}
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

      {/* Add Manual Dialog */}
      <Dialog open={isAddManualDialogOpen} onOpenChange={setIsAddManualDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Manual</DialogTitle>
            <DialogDescription>
              Add a new manual to the shared repository
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                value={newManualMake}
                onChange={(e) => setNewManualMake(e.target.value)}
                placeholder="e.g., DeWalt"
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={newManualModel}
                onChange={(e) => setNewManualModel(e.target.value)}
                placeholder="e.g., DCD777C2"
              />
            </div>
            <div>
              <Label htmlFor="manualFile">Manual File</Label>
              <Input
                type="file"
                id="manualFile"
                onChange={(e) => setManualFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.txt"
              />
            </div>
            <Button
              onClick={handleAddManual}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? "Adding..." : "Add Manual"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}