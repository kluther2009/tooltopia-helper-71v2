import { useState, useRef, useEffect } from "react"
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
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        toast.info("Listening...")
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        if (recognitionRef.current && message.trim()) {
          handleSubmit()
        }
      }

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript
        setMessage(transcript)
        console.log("Speech recognized:", transcript)
        
        // Immediately play back what was said
        if (!isMuted) {
          try {
            console.log("Calling eleven-labs-tts with text:", transcript)
            const response = await supabase.functions.invoke('eleven-labs-tts', {
              body: { text: transcript }
            })

            if (response.error) {
              console.error("Supabase function error:", response.error)
              throw response.error
            }

            console.log("Received response from eleven-labs-tts:", {
              dataExists: !!response.data,
              dataType: typeof response.data
            })

            const audioData = response.data
            const blob = new Blob([audioData], { type: 'audio/mpeg' })
            console.log("Created blob:", {
              blobSize: blob.size,
              blobType: blob.type
            })

            if (blob.size === 0) {
              console.error("Empty audio blob created")
              throw new Error("Empty audio data received")
            }

            const audioUrl = URL.createObjectURL(blob)
            console.log("Created audio URL:", audioUrl)

            if (audioRef.current) {
              const audio = audioRef.current
              audio.src = audioUrl
              
              // Set up audio element event listeners
              audio.onloadedmetadata = () => {
                console.log("Audio metadata loaded, duration:", audio.duration)
              }
              
              audio.oncanplay = () => {
                console.log("Audio is ready to play")
                audio.play()
                  .then(() => {
                    console.log("Audio playback started successfully")
                  })
                  .catch(error => {
                    console.error("Audio playback error:", error)
                    toast.error("Failed to play audio response")
                  })
                  .finally(() => {
                    URL.revokeObjectURL(audioUrl)
                  })
              }

              audio.onerror = () => {
                console.error("Audio loading error:", audio.error)
                toast.error("Failed to load audio")
              }
            }
          } catch (error) {
            console.error("Complete error in TTS pipeline:", error)
            toast.error("Failed to convert text to speech")
          }
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        toast.error("Failed to recognize speech")
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [isMuted]) // Removed message dependency

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!message.trim()) return

    const aiResponse = await sendMessage(message)
    if (aiResponse) {
      setResponse(aiResponse)
      if (!isMuted) {
        try {
          console.log("Getting AI response TTS for:", aiResponse)
          const response = await supabase.functions.invoke('eleven-labs-tts', {
            body: { text: aiResponse }
          })

          if (response.error) {
            console.error("Supabase function error in AI response:", response.error)
            throw response.error
          }

          const audioData = response.data
          const blob = new Blob([audioData], { type: 'audio/mpeg' })
          
          if (blob.size === 0) {
            throw new Error("Empty audio data received")
          }

          const audioUrl = URL.createObjectURL(blob)

          if (audioRef.current) {
            const audio = audioRef.current
            audio.src = audioUrl
            
            audio.oncanplay = () => {
              audio.play()
                .catch(error => {
                  console.error("AI response audio playback error:", error)
                  toast.error("Failed to play audio response")
                })
                .finally(() => {
                  URL.revokeObjectURL(audioUrl)
                })
            }

            audio.onerror = () => {
              console.error("AI response audio loading error:", audio.error)
              toast.error("Failed to load AI response audio")
            }
          }
        } catch (error) {
          console.error("AI response TTS error:", error)
          toast.error("Failed to convert text to speech")
        }
      }
      setMessage("")
    }
  }

  const toggleListening = async () => {
    if (!isListening) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        recognitionRef.current?.start()
      } catch (error) {
        toast.error("Please enable microphone access")
      }
    } else {
      recognitionRef.current?.stop()
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