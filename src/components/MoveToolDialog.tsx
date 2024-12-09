import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MoveToolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function MoveToolDialog({ isOpen, onClose, onConfirm }: MoveToolDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">Update Tool Location</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground">
            This tool has sub-locations. Moving it to a new location will keep its current sub-locations.
            Please make sure to update the sub-locations if needed after moving the tool.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}