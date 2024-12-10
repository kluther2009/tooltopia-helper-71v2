import { Check, ChevronsUpDown } from "lucide-react"
import { useState, useMemo } from "react"
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
  tools?: { tool_name: string }[]
  value: string
  onValueChange: (value: string) => void
}

export function ToolNameAutocomplete({ 
  tools = [], 
  value = "", 
  onValueChange 
}: ToolNameAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  // Ensure tools is always an array and filter based on search
  const filteredTools = useMemo(() => {
    const safeTools = Array.isArray(tools) ? tools : []
    return safeTools.filter((tool) => 
      tool.tool_name.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [tools, searchValue])

  const handleInputChange = (search: string) => {
    setSearchValue(search)
    onValueChange(search)
  }

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
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search tool..." 
            value={searchValue}
            onValueChange={handleInputChange}
          />
          <CommandEmpty>No tool found. Continue typing to add new.</CommandEmpty>
          {filteredTools.length > 0 && (
            <CommandGroup>
              {filteredTools.map((tool) => (
                <CommandItem
                  key={tool.tool_name}
                  value={tool.tool_name}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue)
                    setSearchValue(currentValue)
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