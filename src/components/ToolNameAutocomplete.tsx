import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"

interface ToolNameAutocompleteProps {
  tools: { tool_name: string }[]
  value: string
  onValueChange: (value: string) => void
}

export function ToolNameAutocomplete({ 
  tools = [], 
  value = "", 
  onValueChange 
}: ToolNameAutocompleteProps) {
  const [open, setOpen] = useState(false)

  // Ensure tools is always an array and filter based on the current value
  const filteredTools = Array.isArray(tools) ? tools.filter((tool) => 
    tool.tool_name.toLowerCase().includes((value || "").toLowerCase())
  ) : []

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || "Select or enter tool name..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Search tool..." 
            value={value || ""}
            onValueChange={(newValue) => {
              onValueChange(newValue)
            }}
          />
          <CommandEmpty>No tool found. Type to add new.</CommandEmpty>
          {filteredTools.length > 0 && (
            <CommandGroup>
              {filteredTools.map((tool) => (
                <CommandItem
                  key={tool.tool_name}
                  value={tool.tool_name}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue)
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
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}