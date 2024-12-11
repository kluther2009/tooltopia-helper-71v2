import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToolNameAutocompleteProps {
  value: string
  onValueChange: (value: string) => void
}

export function ToolNameAutocomplete({ value, onValueChange }: ToolNameAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [tools, setTools] = useState<{ tool_name: string }[]>([])

  useEffect(() => {
    const fetchTools = async () => {
      const { data } = await supabase
        .from('tools_reference')
        .select('tool_name')
        .order('tool_name')
      
      if (data) {
        setTools(data)
      }
    }

    fetchTools()
  }, [])

  return (
    <div className="space-y-2">
      <Label htmlFor="toolName">Tool Name</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background text-foreground"
          >
            {value
              ? tools.find((tool) => tool.tool_name === value)?.tool_name
              : "Select tool name..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search tools..." />
            <CommandEmpty>No tool found.</CommandEmpty>
            <CommandGroup>
              {tools.map((tool) => (
                <CommandItem
                  key={tool.tool_name}
                  onSelect={() => {
                    onValueChange(tool.tool_name)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === tool.tool_name ? "opacity-100" : "opacity-0"
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
  )
}