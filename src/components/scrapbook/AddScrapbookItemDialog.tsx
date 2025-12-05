import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, StickyNote, Image as ImageIcon, Mic, Link as LinkIcon } from "lucide-react";
import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";





interface AddScrapbookItemDialogProps {
    projectId: string;
}

export function AddScrapbookItemDialog({ projectId }: AddScrapbookItemDialogProps) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'menu' | 'note' | 'photo' | 'link' | 'voice'>('menu');
    const [noteText, setNoteText] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    const addPhotoMutation = useMutation({
        mutationFn: async ({ file, caption }: { file: File; caption: string }) => {
            setIsUploading(true);
            try {
                // 1. Upload file to storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${projectId}/${crypto.randomUUID()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('scrapbook-media')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                // 2. Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('scrapbook-media')
                    .getPublicUrl(fileName);

                // 3. Create scrapbook item
                const { data: newItem, error: dbError } = await supabase
                    .from("scrapbook_items")
                    .insert({
                        project_id: projectId,
                        type: "photo",
                        content: { caption },
                        media_url: publicUrl,
                    })
                    .select()
                    .single();

                if (dbError) throw dbError;

                // 4. Trigger AI Analysis (Fire and forget)
                supabase.functions.invoke('analyze-media', {
                    body: {
                        mediaUrl: publicUrl,
                        mediaType: 'photo',
                        itemId: newItem.id,
                        projectId
                    }
                }).catch(err => console.error("AI Analysis launch failed:", err));

            } finally {
                setIsUploading(false);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scrapbook", projectId] });
            toast.success("Photo added to scrapbook");
            setOpen(false);
            resetState();
        },
        onError: (error) => {
            console.error("Error adding photo:", error);
            toast.error("Failed to add photo");
        },
    });

    const addLinkMutation = useMutation({
        mutationFn: async ({ url, description }: { url: string; description: string }) => {
            const { error } = await supabase.from("scrapbook_items").insert({
                project_id: projectId,
                type: "link",
                content: { url, description, title: url }, // Basic implementation, could be enhanced with metadata fetching
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scrapbook", projectId] });
            toast.success("Link added to scrapbook");
            setOpen(false);
            resetState();
        },
        onError: (error) => {
            console.error("Error adding link:", error);
            toast.error("Failed to add link");
        },
    });

    const addVoiceMutation = useMutation({
        mutationFn: async ({ blob, caption }: { blob: Blob; caption: string }) => {
            setIsUploading(true);
            try {
                const fileName = `${projectId}/${crypto.randomUUID()}.webm`;

                const { error: uploadError } = await supabase.storage
                    .from('scrapbook-media')
                    .upload(fileName, blob);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('scrapbook-media')
                    .getPublicUrl(fileName);

                const { data: newItem, error: dbError } = await supabase
                    .from("scrapbook_items")
                    .insert({
                        project_id: projectId,
                        type: "voice",
                        content: { caption },
                        media_url: publicUrl,
                    })
                    .select()
                    .single();

                if (dbError) throw dbError;

                // Trigger AI Analysis for Voice
                supabase.functions.invoke('analyze-media', {
                    body: {
                        mediaUrl: publicUrl,
                        mediaType: 'voice',
                        itemId: newItem.id,
                        projectId
                    }
                }).catch(err => console.error("AI Analysis launch failed:", err));

            } finally {
                setIsUploading(false);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scrapbook", projectId] });
            toast.success("Voice note added");
            setOpen(false);
            resetState();
        },
        onError: (error) => {
            console.error("Error adding voice note:", error);
            toast.error("Failed to add voice note");
        },
    });

    const resetState = () => {
        setMode("menu");
        setNoteText("");
        setLinkUrl("");
        setPhotoFile(null);
        setAudioBlob(null);
        setRecordingTime(0);
        setIsRecording(false);
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) resetState();
    };

    const handleAddNote = () => {
        if (!noteText.trim()) return;
        addNoteMutation.mutate(noteText);
    };

    const handleAddPhoto = () => {
        if (!photoFile) return;
        addPhotoMutation.mutate({ file: photoFile, caption: noteText });
    };

    const handleAddLink = () => {
        if (!linkUrl.trim()) return;
        addLinkMutation.mutate({ url: linkUrl, description: noteText });
    };

    const handleAddVoice = () => {
        if (!audioBlob) return;
        addVoiceMutation.mutate({ blob: audioBlob, caption: noteText });
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const chunks: BlobPart[] = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast.error("Could not access microphone");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                            className="h-24 flex flex-col gap-2 hover:bg-blue-100/10 hover:border-blue-500"
                            onClick={() => setMode("photo")}
                        >
                            <ImageIcon className="h-8 w-8 text-blue-500" />
                            <span>Photo</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2 hover:bg-red-100/10 hover:border-red-500"
                            onClick={() => setMode("voice")}
                        >
                            <Mic className="h-8 w-8 text-red-500" />
                            <span>Voice</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2 hover:bg-green-100/10 hover:border-green-500"
                            onClick={() => setMode("link")}
                        >
                            <LinkIcon className="h-8 w-8 text-green-500" />
                            <span>Link</span>
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

                {mode === "photo" && (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-lg p-6 hover:bg-zinc-900/50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileSelect}
                            />
                            {photoFile ? (
                                <div className="text-center">
                                    <p className="text-sm font-medium text-green-500">{photoFile.name}</p>
                                    <p className="text-xs text-zinc-500">Click to change</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <ImageIcon className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
                                    <p className="text-sm text-zinc-400">Click to upload photo</p>
                                </div>
                            )}
                        </div>

                        <Textarea
                            placeholder="Add a caption (optional)..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="min-h-[80px]"
                        />

                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setMode("menu")}>
                                Back
                            </Button>
                            <Button
                                onClick={handleAddPhoto}
                                disabled={!photoFile || isUploading}
                            >
                                {isUploading ? "Uploading..." : "Add Photo"}
                            </Button>
                        </div>
                    </div>
                )}

                {mode === "link" && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <input
                                type="url"
                                placeholder="Paste URL here (https://...)"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <Textarea
                            placeholder="Add a description (optional)..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="min-h-[80px]"
                        />

                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setMode("menu")}>
                                Back
                            </Button>
                            <Button
                                onClick={handleAddLink}
                                disabled={!linkUrl.trim() || addLinkMutation.isPending}
                            >
                                {addLinkMutation.isPending ? "Adding..." : "Add Link"}
                            </Button>
                        </div>
                    </div>
                )}

                {mode === "voice" && (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <div className={`text-4xl font-mono font-bold ${isRecording ? 'text-red-500 animate-pulse' : 'text-zinc-400'}`}>
                                {formatTime(recordingTime)}
                            </div>

                            {!isRecording && !audioBlob && (
                                <Button
                                    size="lg"
                                    className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg"
                                    onClick={startRecording}
                                >
                                    <Mic className="h-8 w-8 text-white" />
                                </Button>
                            )}

                            {isRecording && (
                                <Button
                                    size="lg"
                                    className="h-16 w-16 rounded-full bg-zinc-800 hover:bg-zinc-700 border-2 border-red-500"
                                    onClick={stopRecording}
                                >
                                    <div className="h-6 w-6 bg-red-500 rounded-sm" />
                                </Button>
                            )}

                            {audioBlob && !isRecording && (
                                <div className="flex gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setAudioBlob(null);
                                            setRecordingTime(0);
                                        }}
                                    >
                                        Record Again
                                    </Button>
                                </div>
                            )}
                        </div>

                        <Textarea
                            placeholder="Add a caption (optional)..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="min-h-[80px]"
                        />

                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setMode("menu")}>
                                Back
                            </Button>
                            <Button
                                onClick={handleAddVoice}
                                disabled={!audioBlob || isUploading}
                            >
                                {isUploading ? "Uploading..." : "Add Voice Note"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
