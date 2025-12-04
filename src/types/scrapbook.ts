export type ScrapbookItemType = 'photo' | 'note' | 'voice' | 'link';

export interface ScrapbookItem {
    id: string;
    project_id: string;
    type: ScrapbookItemType;
    content: any; // JSONB
    media_url?: string;
    tags?: string[];
    created_at: string;
    created_by: string;
}

export interface NoteContent {
    text: string;
    is_action_item?: boolean;
}

export interface PhotoContent {
    ocr_text?: string;
    detected_objects?: string[];
}

export interface VoiceContent {
    transcription?: string;
    duration_sec?: number;
}

export interface LinkContent {
    url: string;
    title?: string;
    thumbnail?: string;
}
