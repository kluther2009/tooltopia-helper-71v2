import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

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
  const navigate = useNavigate()

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

  useEffect(() => {
    const handleManualSearch = async () => {
      console.log('Searching for manuals with query:', searchQuery)
      setIsSearching(true)
      try {
        if (searchQuery.trim().length === 0) {
          const { data, error } = await supabase
            .from('manuals')
            .select('id, make, model, file_path')
            .limit(10)
            .order('created_at', { ascending: false })

          if (error) throw error
          setManuals(data || [])
          return
        }

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

    if (isManualDialogOpen) {
      handleManualSearch()
    }
  }, [searchQuery, isManualDialogOpen])

  const handleManualClick = (manual: Manual) => {
    console.log('Selecting manual:', manual)
    onManualSelect(manual.id)
    setIsManualDialogOpen(false)
    toast.success(`Manual selected: ${manual.make} ${manual.model}`)
  }

  const handleAddManual = () => {
    const currentPath = window.location.pathname
    navigate('/add-manual', { state: { returnTo: currentPath } })
  }

  const openManual = async () => {
    if (!selectedManual?.file_path) return

    try {
      const { data } = supabase.storage
        .from('warranty-files')
        .getPublicUrl(selectedManual.file_path)
      
      if (data.publicUrl) {
        window.open(data.publicUrl, '_blank')
      }
    } catch (error) {
      console.error('Error opening manual:', error)
      toast.error('Failed to open manual')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 min-h-[2.5rem] p-2 bg-muted rounded-md">
        {selectedManual ? (
          <div className="flex items-center justify-between w-full">
            <span 
              className="text-primary cursor-pointer hover:underline"
              onClick={openManual}
            >
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
          className="w-full"
        >
          Search Manuals
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddManual}
          className="w-full"
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
            <Input
              placeholder="Search by make or model (e.g. 'DeWalt' or 'DCD777')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {manuals.map((manual) => (
                  <div
                    key={manual.id}
                    onClick={() => handleManualClick(manual)}
                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-[#FEC6A1]/50"
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