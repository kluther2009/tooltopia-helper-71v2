import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrapbookItem } from "@/types/scrapbook";
import { NoteCard } from "./NoteCard";
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    if (!items?.length) {
        return (
            <div className="text-center py-12 text-slate-400 bg-slate-800/50 rounded-lg border border-slate-700 border-dashed">
                <p>Your scrapbook is empty.</p>
                <p className="text-sm">Tap the + button to add notes, photos, or ideas.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => {
                switch (item.type) {
                    case "note":
                        return <NoteCard key={item.id} item={item} />;
                    // Other types will be added in future stages
                    default:
                        return (
                            <div key={item.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                                Unknown item type: {item.type}
                            </div>
                        );
                }
            })}
        </div>
    );
}
