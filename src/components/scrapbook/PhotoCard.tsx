import { ScrapbookItem, PhotoContent } from "@/types/scrapbook";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PhotoCardProps {
    item: ScrapbookItem;
}

export function PhotoCard({ item }: PhotoCardProps) {
    const content = item.content as PhotoContent & { caption?: string };
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
            toast.success("Photo deleted");
        },
        onError: () => {
            toast.error("Failed to delete photo");
        },
    });

    const aiData = content.ai_data;
    // content.caption is user manual caption. aiData.description is AI summary.

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-none bg-zinc-900/50 relative flex flex-col h-full">
            <div className="relative aspect-video w-full overflow-hidden shrink-0">
                <img
                    src={item.media_url}
                    alt={content.caption || aiData?.description || "Scrapbook photo"}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="p-3 space-y-2 flex-grow flex flex-col">
                {content.caption && (
                    <p className="text-sm text-zinc-200 line-clamp-2 font-medium">{content.caption}</p>
                )}

                {aiData?.description && !content.caption && (
                    <p className="text-sm text-zinc-300 line-clamp-2 italic">{aiData.description}</p>
                )}

                {aiData?.tags && aiData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {aiData.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded-full text-zinc-400">
                                {tag}
                            </span>
                        ))}
                        {aiData.tags.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-zinc-500">+{aiData.tags.length - 3}</span>
                        )}
                    </div>
                )}

                <div className="mt-auto pt-2 flex justify-between items-center">
                    <p className="text-xs text-zinc-500">
                        {format(new Date(item.created_at), "MMM d, yyyy")}
                    </p>
                    {aiData?.ocr_text && (
                        <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                            TXT
                        </span>
                    )}
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-white bg-black/50 hover:bg-red-500 hover:text-white"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </Card>
    );
}
