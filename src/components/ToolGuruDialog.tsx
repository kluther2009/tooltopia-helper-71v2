import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { AIChat } from "./AIChat"
import { Card } from "@/components/ui/card"

export function ToolGuruDialog() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed bottom-4 right-4 bg-[#9b87f5] hover:bg-[#7E69AB] text-white shadow-lg"
          aria-label="Open ToolGuru"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="sr-only">Open ToolGuru</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] sm:max-w-[500px] bg-[#1A1F2C] border-[#7E69AB] p-0">
        <Card className="h-full bg-[#1A1F2C] border-0">
          <SheetHeader className="p-6 border-b border-[#7E69AB]/20">
            <SheetTitle className="text-[#D6BCFA] text-xl font-semibold">ToolGuru</SheetTitle>
          </SheetHeader>
          <div className="p-6 space-y-6">
            <div className="text-sm text-[#8E9196]">
              Welcome to ToolGuru - Your smart assistant for all tool-related questions. How can I help you today?
            </div>
            <div className="bg-[#1A1F2C] rounded-lg">
              <AIChat />
            </div>
          </div>
        </Card>
      </SheetContent>
    </Sheet>
  )
}