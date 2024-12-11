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
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!inputValue) {
        setSuggestions([])
        return
      }

      const { data, error } = await supabase
        .from('tools_reference')
        .select('tool_name')
        .ilike('tool_name', `%${inputValue}%`)
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
      setOpen(true)
    }

    fetchSuggestions()
  }, [inputValue])

  return (
    <Command className="rounded-lg border border-input">
      <CommandInput
        value={inputValue}
        onValueChange={(value) => {
          setInputValue(value)
          onValueChange(value)
        }}
        placeholder="Type a tool name..."
        className="h-9"
      />
      {suggestions.length > 0 && open && (
        <CommandGroup className="max-h-48 overflow-y-auto">
          <CommandEmpty>No tools found.</CommandEmpty>
          {suggestions.map((suggestion) => (
            <CommandItem
              key={suggestion}
              value={suggestion}
              onSelect={(currentValue) => {
                setInputValue(currentValue)
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