# Stage 4: The "Brain" - Detailed Design & Walkthrough

## 1. The Core Philosophy: "From Storage to Intelligence"

Currently, the Project Scrapbook is a **passive storage container**. It holds what you put in it, but it doesn't help you understand or find it later.
**Stage 4 transforms it into an active assistant.**

### The "Utility" Gap
*   **Current State**: To find the price of the tile you photographed 3 weeks ago, you have to scroll through 50 photos.
*   **Future State (The Brain)**: You type "tile price" or "receipt", and the AI finds the exact image and highlights the text "$45.99".

### How We Make It Effective
To ensure this isn't just a gimmick, the AI must be:
1.  **Invisible**: It works in the background. No "Click here to analyze" buttons. It just happens.
2.  **Forgiving**: If the AI gets it wrong (e.g., tags a "drill" as a "driver"), the user can easily correct it.
3.  **Context-Aware**: It knows this is a "DIY Project", not a family vacation album. It looks for *materials, tools, dimensions, and prices*.

---

## 2. Detailed Feature Breakdown

### A. Visual Intelligence (The "Eye")
*   **Auto-Tagging**: Every photo is analyzed for objects.
    *   *Example*: A photo of a messy workbench is tagged: `hammer`, `nails`, `wood glue`, `pine board`.
*   **Optical Character Recognition (OCR)**: Text in images is extracted and made searchable.
    *   *Example*: A photo of a paint can label allows you to search for "Satin Finish" or the color code "SW 7005".
*   **Smart Description**: A one-sentence summary is generated for accessibility and quick scanning.
    *   *Example*: "Photo of a receipt from Home Depot for copper pipes and fittings."

### B. Audio Intelligence (The "Ear")
*   **Transcription**: Voice notes are converted to text.
*   **Action Item Extraction** (Advanced): The AI identifies tasks within the voice note.
    *   *Voice Note*: "I need to buy more 2-inch screws and finish sanding the door."
    *   *AI Extraction*: Creates a checklist item: `[ ] Buy 2-inch screws`.

---

## 3. User Walkthrough: The "Bathroom Reno" Scenario

Let's walk through how a user interacts with "The Brain" in a real-world scenario.

### Step 1: The Quick Capture (On Site)
**User**: Is at the hardware store. Sees a vanity they like but isn't ready to buy.
**Action**: Opens Tooltopia > Scrapbook > Tap "+" > Tap "Photo". Snaps a picture of the vanity and the price tag.
**User Effort**: 5 seconds. No typing.

### Step 2: The Invisible Processing (Background)
**System**:
1.  Uploads image to Supabase Storage.
2.  Triggers `analyze-image` Edge Function.
3.  AI analyzes image:
    *   *Tags*: `vanity`, `bathroom`, `sink`, `white`, `modern`.
    *   *OCR*: `$499.00`, `Model: K-1234`, `Dimensions: 30x20`.
    *   *Description*: "White modern bathroom vanity with ceramic sink top."
4.  Updates the Scrapbook Item in the database with this metadata.

### Step 3: The Retrieval (3 Weeks Later)
**User**: Is back home, planning the budget. Needs that price.
**Action**: Opens Scrapbook. Types "vanity" in the search bar.
**Result**: The photo appears instantly. The user sees the auto-generated caption: "White modern vanity - $499.00".
**Value**: User didn't have to remember *when* they took the photo or scroll through hundreds of items.

### Step 4: The Voice Note (Driving Home)
**User**: Realizes they forgot to measure the drain offset.
**Action**: Taps "+" > "Voice". Says: "Remember to measure the drain offset for the new vanity before buying the P-trap."
**System**: Transcribes audio to text.
**Result**: Next time the user opens the project, they see a text note: *"Remember to measure the drain offset..."* alongside the audio player. They don't have to listen to the clip to know what it says.

---

## 4. Technical Architecture & Data Flow

### The "Reactive" Pattern
We will use Supabase Database Webhooks (or Client-side Optimistic UI + Server Processing) to keep the frontend snappy.

1.  **Client**: Uploads file -> Inserts row to `scrapbook_items`.
2.  **Supabase**: Fires webhook `on_insert` -> Calls Edge Function.
3.  **Edge Function**:
    *   Fetches file from Storage.
    *   Calls AI Provider (OpenAI/Gemini).
    *   Updates row with `content.ai_data`.
4.  **Client**: Receives real-time update (via Supabase Realtime) and displays the new tags/text.

### Data Schema Updates
We need to extend the `content` JSONB column to hold AI data without breaking existing fields.

```json
// Photo Item Content
{
  "caption": "User's manual caption",
  "ai_data": {
    "tags": ["vanity", "sink"],
    "description": "White vanity...",
    "ocr_text": "$499.00 Model K-1234",
    "confidence": 0.95
  }
}
```

## 5. Implementation Strategy

1.  **Setup Edge Functions**: Initialize Supabase Edge Functions environment.
2.  **Develop `analyze-image`**: Connect to OpenAI Vision API.
3.  **Develop `transcribe-audio`**: Connect to OpenAI Whisper API.
4.  **Frontend Integration**:
    *   Add "Processing..." indicators while AI is working.
    *   Display Tags and OCR text in the `PhotoCard`.
    *   Display Transcript in the `VoiceCard`.
    *   Implement the **Smart Search Bar**.
