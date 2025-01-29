import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"

interface Manual {
  id: string
  make: string
  model: string
  summary: string | null
}

interface ManualSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onManualSelect: (manual: Manual) => void
}

export function ManualSearchDialog({
  open,
  onOpenChange,
  onManualSelect,
}: ManualSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const { data: manuals, isLoading } = useQuery({
    queryKey: ["manuals", searchTerm],
    queryFn: async () => {
      const query = supabase
        .from("manuals")
        .select("id, make, model, summary")
        
      if (searchTerm) {
        query.or(`make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data as Manual[]
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Manuals</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Search by make or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <ScrollArea className="h-[400px] rounded-md border p-4">
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : manuals?.length === 0 ? (
              <p className="text-center text-muted-foreground">No manuals found</p>
            ) : (
              <div className="space-y-4">
                {manuals?.map((manual) => (
                  <div
                    key={manual.id}
                    className="flex flex-col space-y-2 rounded-lg border p-4 hover:bg-accent"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{manual.make} - {manual.model}</h3>
                        {manual.summary && (
                          <p className="text-sm text-muted-foreground">{manual.summary}</p>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          onManualSelect(manual)
                          onOpenChange(false)
                        }}
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}