import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AIChat } from "./AIChat"
import { Card } from "@/components/ui/card"

export function ToolGuruDialog() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="hidden" id="toolGuruTrigger">Open ToolGuru</button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] sm:max-w-[500px] bg-[#1A1F2C] border-[#7E69AB] p-0">
        <Card className="h-full bg-[#1A1F2C] border-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle className="text-xl font-bold text-white">ToolGuru</SheetTitle>
          </SheetHeader>
          <AIChat />
        </Card>
      </SheetContent>
    </Sheet>
  );
}