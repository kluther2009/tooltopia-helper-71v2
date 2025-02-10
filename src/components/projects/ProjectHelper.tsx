
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useProjectHelper } from "@/hooks/useProjectHelper"
import { Loader2, Mic, MicOff } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ProjectHelperProps {
  projectId: string;
}

interface ConversationEntry {
  message: string;
  response: string;
}

export function ProjectHelper({ projectId }: ProjectHelperProps) {
  const [message, setMessage] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [conversation, setConversation] = useState<ConversationEntry[]>([])
  const { sendMessage, isLoading, selectedModel, setSelectedModel } = useProjectHelper(projectId)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    if (conversation.length >= 3) {
      toast.error("Maximum of 3 questions reached. Please start a new conversation.")
      return
    }

    const aiResponse = await sendMessage(message, conversation)
    if (aiResponse) {
      setConversation(prev => [...prev, { message, response: aiResponse }])
      setMessage("")
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

  const startNewConversation = () => {
    setConversation([])
    setMessage("")
    toast.success("Started new conversation")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end p-4">
        <Select value={selectedModel} onValueChange={(value: 'claude' | 'openai') => setSelectedModel(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select AI Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="claude">Claude (Anthropic)</SelectItem>
            <SelectItem value="openai">GPT-4 (OpenAI)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1 px-4">
        {[...conversation].reverse().map((entry, index) => (
          <div key={index} className="space-y-2 mb-4">
            <div className="bg-muted/50 p-4 rounded-md">
              <p className="font-medium text-sm">Question {conversation.length - index}:</p>
              <p className="text-sm">{entry.message}</p>
            </div>
            <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">
              <p className="font-medium text-sm">Answer:</p>
              {entry.response}
            </div>
          </div>
        ))}

        {conversation.length === 3 && (
          <div className="text-center text-sm text-muted-foreground mb-4">
            Maximum questions reached. Click "Start New Conversation" to begin a new session.
          </div>
        )}
      </ScrollArea>
      
      <div className="border-t mt-auto p-4">
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
          <div className="flex gap-2 justify-between">
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
            {conversation.length > 0 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={startNewConversation}
              >
                Start New Conversation
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
