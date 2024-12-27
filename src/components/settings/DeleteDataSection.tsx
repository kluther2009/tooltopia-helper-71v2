import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface DeleteDataSectionProps {
  isDeleting: boolean;
  onDelete: () => Promise<void>;
}

export function DeleteDataSection({ 
  isDeleting, 
  onDelete 
}: DeleteDataSectionProps) {
  return (
    <Card className="p-6 border-destructive">
      <div className="flex items-center gap-3 mb-6">
        <Trash2 className="h-5 w-5 text-destructive" />
        <h2 className="text-xl font-semibold text-destructive">Delete All Data</h2>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Delete all your data including tools, photos, and annotations. This action cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete All My Data"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Tools and their locations</li>
                    <li>Photos and annotations</li>
                    <li>Settings and preferences</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Yes, Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}