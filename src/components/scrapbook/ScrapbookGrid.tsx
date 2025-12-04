import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrapbookItem } from "@/types/scrapbook";
import { NoteCard } from "./NoteCard";
import { PhotoCard } from "./PhotoCard";
import { LinkCard } from "./LinkCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ScrapbookGridProps {
    projectId: string;
}

export function ScrapbookGrid({ projectId }: ScrapbookGridProps) {
    const { data: items, isLoading } = useQuery({
        queryKey: ["scrapbook", projectId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("scrapbook_items")
                .select("*")
                .eq("project_id", projectId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as ScrapbookItem[];
        },
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (!items?.length) {
        return (
            <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                <p className="text-zinc-400">Your scrapbook is empty.</p>
                <p className="text-sm text-zinc-500">Tap the + button to add notes, photos, or ideas.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
                <div key={item.id}>
                    {item.type === "note" && <NoteCard item={item} />}
                    {item.type === "photo" && <PhotoCard item={item} />}
                    {item.type === "link" && <LinkCard item={item} />}
                </div>
            ))}
        </div>
    );
}
