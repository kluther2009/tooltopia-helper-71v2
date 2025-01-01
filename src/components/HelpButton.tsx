import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocation } from "react-router-dom";
import { helpContent } from "@/config/helpContent";

export function HelpButton() {
  const location = useLocation();
  
  const getHelpContent = () => {
    return helpContent[location.pathname as keyof typeof helpContent] || helpContent.default;
  };

  const content = getHelpContent();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg z-50"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription className="text-left pt-4">
            {content.description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}