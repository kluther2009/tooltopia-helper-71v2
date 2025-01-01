import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AIChat } from "./AIChat"
import { Card } from "@/components/ui/card"

export function ToolGuruDialog() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <span className="hidden">Open ToolGuru</span>
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
            <AIChat />
          </div>
        </Card>
      </SheetContent>
    </Sheet>
  )
}