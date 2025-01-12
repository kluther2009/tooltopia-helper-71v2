import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ToolTransferControlsProps {
  onMoveRight: () => void;
  onMoveLeft: () => void;
  canMoveRight: boolean;
  canMoveLeft: boolean;
}

export function ToolTransferControls({
  onMoveRight,
  onMoveLeft,
  canMoveRight,
  canMoveLeft,
}: ToolTransferControlsProps) {
  return (
    <div className="flex flex-col justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onMoveRight}
        disabled={!canMoveRight}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onMoveLeft}
        disabled={!canMoveLeft}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}