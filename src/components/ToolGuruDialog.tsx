import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { AIChat } from "./AIChat"

export function ToolGuruDialog() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label="Open ToolGuru"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="sr-only">Open ToolGuru</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>ToolGuru</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="text-sm text-muted-foreground">
            Welcome to ToolGuru - Your smart assistant for all tool-related questions. How can I help you today?
          </div>
          <AIChat />
        </div>
      </SheetContent>
    </Sheet>
  )
}