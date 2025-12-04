# Agile Implementation Plan: Project Scrapbook

## Strategy
We will build this feature in **4 Iterative Stages**. Each stage delivers a testable, usable slice of functionality. We deploy to production (or staging) after each stage.

---

## Stage 1: The "Walking Skeleton" (Foundation)
**Goal**: Users can see the Scrapbook page and add simple text notes. The database and basic UI structure are in place.

### Tasks
1.  **Database**:
    *   Create `scrapbook_items` table in Supabase.
    *   Set up RLS policies (security).
2.  **Frontend**:
    *   Create `ScrapbookGrid` component (empty state).
    *   Create `NoteCard` component.
    *   Implement "Add Note" button.
3.  **Integration**:
    *   Connect frontend to Supabase to fetch/add notes.

**Definition of Done**:
*   [ ] I can open a Project and see an empty Scrapbook.
*   [ ] I can click "+" -> "Note", type text, and save.
*   [ ] The note appears on the grid.
*   [ ] Data persists on refresh.

---

## Stage 2: The "Visuals" (Photos & Storage)
**Goal**: Users can upload photos. The Scrapbook becomes visual.

### Tasks
1.  **Storage**:
    *   Create `scrapbook-media` bucket in Supabase.
2.  **Frontend**:
    *   Create `PhotoCard` component.
    *   Implement "Upload Photo" in the FAB (Floating Action Button).
    *   Handle image upload logic (resize/compress before upload).
3.  **UI Polish**:
    *   Implement Masonry layout (so photos and notes stack nicely).

**Definition of Done**:
*   [ ] I can click "+" -> "Photo" and select an image.
*   [ ] Image uploads and appears in the grid.
*   [ ] Grid layout adjusts to different image aspect ratios.

---

## Stage 3: The "Multimedia" (Links & Audio)
**Goal**: Users can save links and record voice notes. The "Scrapbook" feel is complete.

### Tasks
1.  **Links**:
    *   Create `LinkCard` component.
    *   Implement "Add Link" dialog.
    *   (Optional) Basic OpenGraph fetcher (display title/image from URL).
2.  **Audio**:
    *   Create `VoiceCard` component.
    *   Implement Audio Recorder hook (`useAudioRecorder`).
    *   Save audio blob to Storage bucket.

**Definition of Done**:
*   [ ] I can paste a YouTube link and see a card with the title.
*   [ ] I can record a 10s voice note and play it back from the card.

---

## Stage 4: The "Brain" (AI Intelligence)
**Goal**: The app does the work. Auto-tagging and transcription.

### Tasks
1.  **Edge Functions**:
    *   Deploy `analyze-image` function (OpenAI Vision).
    *   Deploy `transcribe-audio` function (Whisper).
2.  **Triggers**:
    *   Set up database webhooks or client-side calls to trigger AI after upload.
3.  **UI Updates**:
    *   Show "Analyzing..." state on cards.
    *   Display AI tags on Photo Cards.
    *   Display transcribed text on Voice Cards.

**Definition of Done**:
*   [ ] When I upload a tile photo, it auto-tags "Tile", "Blue", "Ceramic".
*   [ ] When I record a voice note, the text appears on the card automatically.

---

## Estimated Timeline (1 Developer)
*   **Stage 1**: 1-2 Days
*   **Stage 2**: 2 Days
*   **Stage 3**: 2-3 Days
*   **Stage 4**: 3-4 Days
**Total**: ~2 Weeks for full "Killer Feature" status.
