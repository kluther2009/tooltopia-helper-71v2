import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useProjectHelper } from "@/hooks/useProjectHelper"
import { Loader2, Mic, MicOff } from "lucide-react"
import { toast } from "sonner"

interface ProjectHelperProps {
  projectId: string;
}

export function ProjectHelper({ projectId }: ProjectHelperProps) {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [isListening, setIsListening] = useState(false)
  const { sendMessage, isLoading } = useProjectHelper(projectId)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const aiResponse = await sendMessage(message)
    if (aiResponse) {
      setResponse(aiResponse)
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

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask for project advice, timeline estimates, or tool recommendations..."
            className="min-h-[100px] resize-none flex-1"
          />
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
        </div>
        <Button type="submit" disabled={isLoading || !message.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Ask Project Helper"
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