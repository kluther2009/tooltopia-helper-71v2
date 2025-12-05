# Technical Design Statement: Project Scrapbook

## 1. Architecture Overview
The Project Scrapbook will be a modular feature integrated into the existing React + Supabase architecture. It requires a flexible data model to handle mixed media types (text, images, audio, links) and relies heavily on Edge Functions for AI processing.

### Core Components
*   **Frontend**: React (Vite), TanStack Query, Masonry Layout.
*   **Backend**: Supabase (PostgreSQL, Storage, Edge Functions).
*   **AI Services**: OpenAI (Vision, Whisper, GPT-4o) or Gemini via Edge Functions.

## 2. Data Model (Schema)

We need a single, polymorphic table to store all scrapbook items. This avoids creating 4 different tables for Notes, Photos, etc.

### Table: `scrapbook_items`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `project_id` | `uuid` | FK to `projects.id` |
| `type` | `enum` | `'photo'`, `'note'`, `'voice'`, `'link'` |
| `content` | `jsonb` | Flexible payload (see below) |
| `media_url` | `text` | URL to Supabase Storage (for photos/audio) |
| `tags` | `text[]` | AI-generated tags (e.g., `['tile', 'blue']`) |
| `created_at` | `timestamptz` | Creation timestamp |
| `created_by` | `uuid` | FK to `auth.users` |

### JSONB `content` Structure Examples
*   **Note**: `{ "text": "Buy spacers", "is_action_item": true }`
*   **Link**: `{ "url": "https://...", "title": "How to Grout", "thumbnail": "..." }`
*   **Voice**: `{ "transcription": "Wall is 1.8m", "duration_sec": 12 }`
*   **Photo**: `{ "ocr_text": "$400", "detected_objects": ["vanity"] }`

## 3. Backend & API Strategy

### Storage Buckets
*   `scrapbook-media`: Public/Private bucket for storing user uploads (images, audio blobs).

### Edge Functions (The "Smart" Layer)
We will implement a reactive pattern using Database Webhooks or client-side triggers.

1.  **`analyze-scrapbook-image`**:
    *   **Trigger**: On upload of new photo.
    *   **Action**: Sends image to GPT-4o-mini / Gemini Flash.
    *   **Output**: Returns tags, OCR text (prices), and description. Updates `scrapbook_items` row.

2.  **`transcribe-audio`**:
    *   **Trigger**: On upload of audio blob.
    *   **Action**: Sends to OpenAI Whisper.
    *   **Output**: Returns text transcription. Updates `scrapbook_items` row.

## 4. Frontend Implementation

### UI Components
*   **`ScrapbookGrid`**: A responsive masonry layout (using `react-masonry-css` or CSS Grid).
*   **`ScrapbookCard`**: A polymorphic component that renders sub-components based on `item.type`:
    *   `<PhotoCard />`: Renders image + tags overlay.
    *   `<NoteCard />`: Yellow background, editable text area.
    *   `<VoiceCard />`: Waveform visualizer (using `wavesurfer.js`) + transcription text.
    *   `<LinkCard />`: OpenGraph preview (fetched via a proxy or Edge Function).

### State Management
*   **React Query**:
    *   `useScrapbookItems(projectId)`: Fetches items ordered by `created_at` desc.
    *   `useAddScrapbookItem`: Mutation for optimistic updates.

## 5. Security & RLS
*   **RLS Policy**: Users can only `SELECT`, `INSERT`, `UPDATE`, `DELETE` rows where `project_id` belongs to a project they own (or `auth.uid() = created_by`).

## 6. Phased Implementation Plan

### Phase 1: The Foundation (MVP)
*   Create `scrapbook_items` table and Storage bucket.
*   Implement basic UI for adding/viewing Text Notes and Photos (no AI yet).
*   Basic Grid layout.

### Phase 2: Rich Media & Audio
*   Implement Audio Recorder in browser (`MediaRecorder` API).
*   Implement Link preview fetching.

### Phase 3: Intelligence (The "Killer Feature")
*   Deploy Edge Functions for Image Analysis and Audio Transcription.
*   Implement "Smart Tagging" UI.
