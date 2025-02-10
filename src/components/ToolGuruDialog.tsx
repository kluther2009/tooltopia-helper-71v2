
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AIChat } from "./AIChat"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"
import { Button } from "./ui/button"
import { useEffect } from "react"
import { useSidebar } from "@/components/ui/sidebar"

export function ToolGuruDialog() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    // Debug logging for close buttons
    const closeButtons = document.querySelectorAll('[data-state="open"] button');
    closeButtons.forEach((button, index) => {
      console.log('Found close button:', {
        index,
        classList: button.classList,
        parentElement: button.parentElement?.tagName,
        parentClasses: button.parentElement?.classList,
        innerHTML: button.innerHTML,
        attributes: Array.from(button.attributes).map(attr => `${attr.name}=${attr.value}`),
        role: button.getAttribute('role'),
      });
    });

    // Debug logging for sheet content styles
    const sheetContent = document.querySelector('[data-state="open"] > .fixed');
    if (sheetContent) {
      console.log('ToolGuru Sheet Content Styles:', {
        width: sheetContent.clientWidth,
        windowWidth: window.innerWidth,
        computedStyles: window.getComputedStyle(sheetContent),
        classList: sheetContent.classList,
        inlineStyles: sheetContent.getAttribute('style')
      });
    }
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="hidden" id="toolGuruTrigger">Open ToolGuru</button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className={`!w-[calc(100vw-${isCollapsed ? '3.5rem' : '13rem'})] sm:!w-[calc(100vw-${isCollapsed ? '3.5rem' : '13rem'})] p-0 border-0 overflow-hidden right-0 [&_[data-radix-collection-item]]:hidden [&_.absolute]:hidden`}
        style={{ 
          width: `calc(100vw - ${isCollapsed ? '3.5rem' : '13rem'})`, 
          maxWidth: `calc(100vw - ${isCollapsed ? '3.5rem' : '13rem'})` 
        }}
      >
        <Card className="h-[100vh] flex flex-col bg-[#1A1F2C] border-0 rounded-none">
          <SheetHeader className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold text-white">ToolGuru</SheetTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-[#2A2F3C] rounded-md"
                onClick={() => {
                  const trigger = document.getElementById('toolGuruTrigger') as HTMLButtonElement;
                  trigger?.click();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
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
