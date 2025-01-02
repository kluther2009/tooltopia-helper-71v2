import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface TransferButtonsProps {
  onMoveToSelected: () => void;
  onMoveToAvailable: () => void;
  disableRight: boolean;
  disableLeft: boolean;
}

export function TransferButtons({
  onMoveToSelected,
  onMoveToAvailable,
  disableRight,
  disableLeft,
}: TransferButtonsProps) {
  return (
    <div className="flex flex-col justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onMoveToSelected}
        disabled={disableRight}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onMoveToAvailable}
        disabled={disableLeft}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}