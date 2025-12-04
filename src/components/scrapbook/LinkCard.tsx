import { ScrapbookItem } from "@/types/scrapbook";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Link as LinkIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LinkCardProps {
    item: ScrapbookItem;
}

export function LinkCard({ item }: LinkCardProps) {
    const content = item.content as { url: string; title?: string; description?: string };
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
            toast.success("Link deleted");
        },
        onError: () => {
            toast.error("Failed to delete link");
        },
    });

    return (
        <Card className="p-4 bg-green-100/10 border-green-500/50 hover:border-green-500 transition-colors group relative flex flex-col h-full">
            <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                    <LinkIcon className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate pr-6">
                        {content.title || content.url}
                    </h3>
                    <a
                        href={content.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-400 hover:text-green-300 truncate block flex items-center gap-1 mt-0.5"
                    >
                        {content.url}
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
            </div>

            {content.description && (
                <p className="text-sm text-slate-300 line-clamp-3 mb-4 flex-1">
                    {content.description}
                </p>
            )}

            <div className="flex justify-between items-center text-xs text-slate-400 mt-auto pt-2 border-t border-slate-700/50">
                <span>Link</span>
                <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
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
