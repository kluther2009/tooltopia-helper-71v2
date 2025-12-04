import { ScrapbookItem } from "@/types/scrapbook";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";

interface PhotoCardProps {
    item: ScrapbookItem;
}

export function PhotoCard({ item }: PhotoCardProps) {
    const content = item.content as { caption?: string };

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-none bg-zinc-900/50">
            <div className="relative aspect-video w-full overflow-hidden">
                <img
                    src={item.media_url}
                    alt={content.caption || "Scrapbook photo"}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="p-3 space-y-2">
                {content.caption && (
                    <p className="text-sm text-zinc-200 line-clamp-2">{content.caption}</p>
                )}
                <p className="text-xs text-zinc-500">
                    {format(new Date(item.created_at), "MMM d, yyyy")}
                </p>
            </div>
        </Card>
    );
}
