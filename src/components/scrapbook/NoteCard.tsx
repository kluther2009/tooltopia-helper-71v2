import { Card } from "@/components/ui/card";
import { ScrapbookItem, NoteContent } from "@/types/scrapbook";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NoteCardProps {
    item: ScrapbookItem;
}

export function NoteCard({ item }: NoteCardProps) {
    const content = item.content as NoteContent;
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from("scrapbook_items")
                .delete()
                .eq("id", item.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scrapbook", item.project_id] });
            toast.success("Note deleted");
        },
        onError: () => {
            toast.error("Failed to delete note");
        },
    });

    return (
        <Card className="p-4 bg-yellow-100/10 border-yellow-500/50 hover:border-yellow-500 transition-colors group relative">
            <div className="space-y-2">
                <p className="text-white whitespace-pre-wrap">{content.text}</p>
                <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
                    <span>Note</span>
                    <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-500/10"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </Card>
    );
}
