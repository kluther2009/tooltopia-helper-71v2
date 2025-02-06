
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
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
        className="w-[100vw] sm:w-[80vw] lg:w-[50vw] p-0 border-l-0 border-t-0 border-b-0 overflow-hidden"
      >
        <Card className="h-[100vh] flex flex-col bg-[#1A1F2C] border-0 rounded-none">
          <SheetHeader className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold text-white">ToolGuru</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="text-white hover:text-white/80">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
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
