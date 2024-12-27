import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAIChat } from "@/hooks/useAIChat"
import { Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

export function AIChat() {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const { sendMessage, isLoading } = useAIChat()
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const aiResponse = await sendMessage(message)
    if (aiResponse) {
      setResponse(aiResponse)
      if (!isMuted) {
        try {
          const { data, error } = await supabase.functions.invoke('eleven-labs-tts', {
            body: { text: aiResponse }
          })

          if (error) {
            console.error('TTS Error:', error)
            toast.error("Voice response unavailable. Text response still available.", {
              duration: 5000
            })
            return
          }

          if (!data) {
            toast.error("No audio data received", { duration: 5000 })
            return
          }

          // Convert the array buffer to a Blob
          const audioBlob = new Blob([new Uint8Array(data)], { type: 'audio/mpeg' })
          const audioUrl = URL.createObjectURL(audioBlob)

          if (audioRef.current) {
            audioRef.current.src = audioUrl
            try {
              await audioRef.current.play()
            } catch (playError) {
              console.error("Audio playback error:", playError)
              toast.error("Failed to play audio. Please try again.")
              // Clean up the audio URL
              URL.revokeObjectURL(audioUrl)
            }
          }
        } catch (error) {
          console.error("TTS error:", error)
          toast.error("Failed to convert text to speech. Text response still available.", {
            duration: 5000
          })
        }
      }
    }
  }

  const toggleListening = async () => {
    if (!isListening) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        setIsListening(true)
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setMessage(transcript)
          setIsListening(false)
          toast.success("Speech recognized")
        }

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          toast.error("Failed to recognize speech")
          setIsListening(false)
        }

        recognition.start()
      } catch (error) {
        console.error("Microphone access error:", error)
        toast.error("Please enable microphone access")
        setIsListening(false)
      }
    } else {
      setIsListening(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
    toast.success(isMuted ? "Voice unmuted" : "Voice muted")
  }

  return (
    <div className="space-y-4">
      <audio ref={audioRef} className="hidden" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me anything about tools, maintenance, or organization..."
            className="min-h-[100px] resize-none flex-1"
          />
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleListening}
              className={isListening ? "bg-red-100" : ""}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <Button type="submit" disabled={isLoading || !message.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Thinking...
            </>
          ) : (
            "Ask ToolGuru"
          )}
        </Button>
      </form>
      {response && (
        <div className="mt-4">
          <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">
            {response}
          </div>
        </div>
      )}
    </div>
  )
}