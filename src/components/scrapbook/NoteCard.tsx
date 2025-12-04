import { Card } from "@/components/ui/card";
import { ScrapbookItem, NoteContent } from "@/types/scrapbook";
import { formatDistanceToNow } from "date-fns";

interface NoteCardProps {
    item: ScrapbookItem;
}

export function NoteCard({ item }: NoteCardProps) {
    const content = item.content as NoteContent;

    return (
        <Card className="p-4 bg-yellow-100/10 border-yellow-500/50 hover:border-yellow-500 transition-colors">
            <div className="space-y-2">
                <p className="text-white whitespace-pre-wrap">{content.text}</p>
                <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
                    <span>Note</span>
                    <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                </div>
            </div>
        </Card>
    );
}
