import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, StickyNote, Image as ImageIcon, Mic, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddScrapbookItemDialogProps {
    projectId: string;
}

export function AddScrapbookItemDialog({ projectId }: AddScrapbookItemDialogProps) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'menu' | 'note'>('menu');
    const [noteText, setNoteText] = useState("");
    const queryClient = useQueryClient();

    const addNoteMutation = useMutation({
        mutationFn: async (text: string) => {
            const { error } = await supabase.from("scrapbook_items").insert({
                project_id: projectId,
                type: "note",
                content: { text },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scrapbook", projectId] });
            toast.success("Note added to scrapbook");
            setOpen(false);
            resetState();
        },
        onError: (error) => {
            console.error("Error adding note:", error);
            toast.error("Failed to add note");
        },
    });

    const resetState = () => {
        setMode("menu");
        setNoteText("");
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) resetState();
    };

    const handleAddNote = () => {
        if (!noteText.trim()) return;
        addNoteMutation.mutate(noteText);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg fixed bottom-6 right-6 z-50"
                >
                    <Plus className="h-6 w-6 text-white" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add to Scrapbook</DialogTitle>
                </DialogHeader>

                {mode === "menu" && (
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2 hover:bg-yellow-100/10 hover:border-yellow-500"
                            onClick={() => setMode("note")}
                        >
                            <StickyNote className="h-8 w-8 text-yellow-500" />
                            <span>Note</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2 opacity-50 cursor-not-allowed"
                            disabled
                        >
                            <ImageIcon className="h-8 w-8 text-blue-500" />
                            <span>Photo (Coming Soon)</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2 opacity-50 cursor-not-allowed"
                            disabled
                        >
                            <Mic className="h-8 w-8 text-red-500" />
                            <span>Voice (Coming Soon)</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2 opacity-50 cursor-not-allowed"
                            disabled
                        >
                            <LinkIcon className="h-8 w-8 text-green-500" />
                            <span>Link (Coming Soon)</span>
                        </Button>
                    </div>
                )}

                {mode === "note" && (
                    <div className="space-y-4">
                        <Textarea
                            placeholder="Type your note here..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="min-h-[150px]"
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setMode("menu")}>
                                Back
                            </Button>
                            <Button onClick={handleAddNote} disabled={!noteText.trim() || addNoteMutation.isPending}>
                                {addNoteMutation.isPending ? "Adding..." : "Add Note"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
