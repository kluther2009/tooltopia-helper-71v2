import { useState, useEffect } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { supabase } from "@/integrations/supabase/client"

interface ToolNameAutocompleteProps {
  value: string
  onValueChange: (value: string) => void
}

export function ToolNameAutocomplete({ value, onValueChange }: ToolNameAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!value) {
        setSuggestions([])
        return
      }

      const { data, error } = await supabase
        .from('tools_reference')
        .select('tool_name')
        .ilike('tool_name', `%${value}%`)
        .limit(5)

      if (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
        return
      }

      // Extract unique tool names from the response and ensure we have valid data
      const uniqueTools = Array.from(
        new Set(
          (data || [])
            .map(item => item?.tool_name)
            .filter((name): name is string => typeof name === 'string' && name.length > 0)
        )
      )

      setSuggestions(uniqueTools)
    }

    fetchSuggestions()
  }, [value])

  return (
    <Command 
      className="rounded-lg border border-input"
      onValueChange={(value) => {
        onValueChange(value)
        setOpen(true)
      }}
    >
      <CommandInput
        value={value}
        onValueChange={(value) => {
          onValueChange(value)
          setOpen(true)
        }}
        placeholder="Type a tool name..."
        className="h-9"
      />
      {open && suggestions.length > 0 && (
        <CommandGroup className="max-h-48 overflow-y-auto">
          <CommandEmpty>No tools found.</CommandEmpty>
          {suggestions.map((suggestion) => (
            <CommandItem
              key={suggestion}
              value={suggestion}
              onSelect={(currentValue) => {
                onValueChange(currentValue)
                setOpen(false)
              }}
            >
              {suggestion}
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </Command>
  )
}