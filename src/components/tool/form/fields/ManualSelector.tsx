import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface Manual {
  id: string
  make: string
  model: string
  file_path: string
}

interface ManualSelectorProps {
  selectedManual: Manual | null
  onManualSelect: (manualId: string | null) => void
  manualId: string | null
}

export function ManualSelector({ selectedManual, onManualSelect, manualId }: ManualSelectorProps) {
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [manuals, setManuals] = useState<Manual[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleManualSearch = async () => {
    console.log('Searching for manuals with query:', searchQuery)
    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from('manuals')
        .select('id, make, model, file_path')
        .or(`make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`)
        .limit(10)

      if (error) throw error
      console.log('Search results:', data)
      setManuals(data || [])
    } catch (error) {
      console.error('Error searching manuals:', error)
      toast.error('Failed to search manuals')
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    if (isManualDialogOpen) {
      handleManualSearch()
    }
  }, [isManualDialogOpen])

  const handleManualClick = (manual: Manual) => {
    console.log('Selecting manual:', manual)
    onManualSelect(manual.id)
    setIsManualDialogOpen(false)
    toast.success(`Manual selected: ${manual.make} ${manual.model}`)
  }

  const handleAddManual = () => {
    // Navigate to the add manual page
    window.location.href = '/add-manual'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 min-h-[2.5rem] p-2 bg-muted rounded-md">
        {selectedManual ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-primary">
              {selectedManual.make} - {selectedManual.model}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onManualSelect(null)}
            >
              Clear
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground">No manual selected</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
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
          onClick={handleAddManual}
        >
          Add Manual
        </Button>
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
                    onClick={() => handleManualClick(manual)}
                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-slate-100"
                  >
                    <div>
                      <div className="font-medium">{manual.make}</div>
                      <div className="text-sm text-muted-foreground">{manual.model}</div>
                    </div>
                  </div>
                ))}
                {manuals.length === 0 && !isSearching && (
                  <div className="text-center text-muted-foreground py-4">
                    No manuals found
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}