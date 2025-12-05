import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BrainSearchBarProps {
    projectId: string;
}

export function BrainSearchBar({ projectId }: BrainSearchBarProps) {
    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState<string | null>(null);

    const askBrainMutation = useMutation({
        mutationFn: async (text: string) => {
            const { data, error } = await supabase.functions.invoke('chat-with-brain', {
                body: { query: text, projectId }
            });
            if (error) throw error;
            return data.answer;
        },
        onSuccess: (data) => {
            setAnswer(data);
        },
        onError: (error) => {
            console.error("Brain error:", error);
            toast.error("The Brain is having trouble thinking right now.");
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setAnswer(null);
        askBrainMutation.mutate(query);
    };

    return (
        <div className="w-full space-y-4">
            <form onSubmit={handleSearch} className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-zinc-500" />
                <Input
                    placeholder="Ask the Brain... (e.g., 'Do I have enough screws?', 'Price of the vanity?')"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9 pr-12 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-purple-500"
                    disabled={askBrainMutation.isPending}
                />
                <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 text-purple-500 hover:text-purple-400 hover:bg-purple-500/10"
                    disabled={askBrainMutation.isPending || !query.trim()}
                >
                    <Sparkles className={`h-4 w-4 ${askBrainMutation.isPending ? 'animate-pulse' : ''}`} />
                </Button>
            </form>

            {answer && (
                <Alert className="bg-purple-500/10 border-purple-500/30 text-purple-200">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <AlertTitle className="flex justify-between items-center text-purple-400">
                        The Brain
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 -mr-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                            onClick={() => setAnswer(null)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </AlertTitle>
                    <AlertDescription className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                        {answer}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
