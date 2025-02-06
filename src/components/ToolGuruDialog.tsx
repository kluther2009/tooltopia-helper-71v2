
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AIChat } from "./AIChat"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"
import { Button } from "./ui/button"

export function ToolGuruDialog() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="hidden" id="toolGuruTrigger">Open ToolGuru</button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[80vw] lg:w-[50vw] p-0 border-l border-border bg-[#1A1F2C]"
      >
        <Card className="h-full flex flex-col bg-[#1A1F2C] border-0">
          <SheetHeader className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold text-white">ToolGuru</SheetTitle>
              <Sheet.Close asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </Sheet.Close>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <AIChat />
          </div>
        </Card>
      </SheetContent>
    </Sheet>
  );
}
