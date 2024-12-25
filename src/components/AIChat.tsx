import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useAIChat } from "@/hooks/useAIChat"
import { Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { useConversation } from "@11labs/react"
import { toast } from "sonner"

export function AIChat() {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const { sendMessage, isLoading } = useAIChat()
  
  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs")
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs")
      setIsListening(false)
    },
    onError: (error) => {
      console.error("ElevenLabs error:", error)
      toast.error("Voice chat error occurred")
      setIsListening(false)
    },
    overrides: {
      tts: {
        voiceId: "Charlie", // Using Charlie voice - professional and friendly
      },
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const aiResponse = await sendMessage(message)
    if (aiResponse) {
      setResponse(aiResponse)
      if (!isMuted) {
        // Start TTS conversion and playback
        try {
          await conversation.startConversation({
            agentId: "default", // Using default agent
            text: aiResponse,
          })
        } catch (error) {
          console.error("TTS error:", error)
          toast.error("Failed to convert text to speech")
        }
      }
    }
  }

  const toggleListening = async () => {
    if (!isListening) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        setIsListening(true)
        // Start speech recognition
        const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)()
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setMessage(transcript)
          setIsListening(false)
        }

        recognition.onerror = (event) => {
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
    if (conversation) {
      conversation.setVolume({ volume: isMuted ? 1 : 0 })
    }
  }

  return (
    <div className="space-y-4">
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