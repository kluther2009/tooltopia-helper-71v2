import { ScrapbookItem, VoiceContent } from "@/types/scrapbook";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Play, Pause, Mic } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";

interface VoiceCardProps {
    item: ScrapbookItem;
}

export function VoiceCard({ item }: VoiceCardProps) {
    const content = item.content as VoiceContent & { caption?: string; duration?: number };
    const queryClient = useQueryClient();
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

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
            toast.success("Voice note deleted");
        },
        onError: () => {
            toast.error("Failed to delete voice note");
        },
    });

    useEffect(() => {
        if (item.media_url) {
            audioRef.current = new Audio(item.media_url);
            audioRef.current.onended = () => setIsPlaying(false);
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [item.media_url]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const aiData = content.ai_data;

    return (
        <Card className="p-4 bg-red-100/10 border-red-500/50 hover:border-red-500 transition-colors group relative">
            <div className="flex items-center gap-3 mb-3">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    onClick={togglePlay}
                >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </Button>
                <div className="flex-1">
                    <div className="h-1 bg-red-500/20 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-red-500 transition-all duration-300 ${isPlaying ? 'animate-pulse w-full' : 'w-0'}`}
                        />
                    </div>
                </div>
                <Mic className="h-4 w-4 text-red-500/50" />
            </div>

            {content.caption && (
                <p className="text-sm text-zinc-200 line-clamp-2 mb-2 font-medium">{content.caption}</p>
            )}

            {aiData?.transcription && (
                <div className="mb-3 p-2 bg-black/20 rounded text-xs text-zinc-300 italic">
                    "{aiData.transcription}"
                </div>
            )}

            {aiData?.action_items && (
                <div className="mb-2 space-y-1">
                    {aiData.action_items.map((action, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                            <span className="text-red-400 mt-0.5">☐</span>
                            <span>{action}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-700/50">
                <span>Voice Note</span>
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
