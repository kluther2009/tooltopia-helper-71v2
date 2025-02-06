
import { useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { setupSpeechRecognition } from '@/utils/speechRecognition'
import { convertTextToSpeech } from '@/utils/textToSpeech'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { useAIChat } from '@/hooks/useAIChat'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Send, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { ScrollArea } from './ui/scroll-area'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function AIChat() {
  const [isListening, setIsListening] = useState(false)
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const recognitionRef = useRef<any>(null)
  const { playAudio, cleanupAudioResources } = useAudioPlayer()
  const { sendMessage, isLoading } = useAIChat()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please sign in to use ToolGuru')
        navigate('/login')
      }
    }
    
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  const handleSpeechResult = async (transcript: string) => {
    setMessage(transcript)
    
    if (!isMuted) {
      try {
        const textToSpeak = `You said ${transcript}`
        const audioArrayBuffer = await convertTextToSpeech(textToSpeak)
        await playAudio(audioArrayBuffer)
      } catch (error) {
        console.error('TTS error:', error)
        toast.error('Failed to convert text to speech')
      }
    }
  }

  const startListening = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = setupSpeechRecognition(
        handleSpeechResult,
        (error) => {
          setIsListening(false)
          toast.error('Speech recognition error occurred')
        }
      )

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    recognitionRef.current.start()
    setIsListening(true)
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!message.trim()) {
      toast.error('Please enter a message first')
      return
    }

    // Add user message to chat history
    setChatHistory(prev => [...prev, { role: 'user', content: message }])
    const currentMessage = message
    setMessage('')

    try {
      const response = await sendMessage(currentMessage)
      if (response) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: response }])
      }
    } catch (error) {
      console.error('Error asking ToolGuru:', error)
      toast.error('Failed to get response from ToolGuru')
    }
  }

  useEffect(() => {
    return () => {
      cleanupAudioResources()
    }
  }, [cleanupAudioResources])

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 mb-4">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-muted text-muted-foreground mr-4'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form 
        onSubmit={handleSubmit}
        className="border-t border-border p-4 space-y-4"
      >
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask ToolGuru anything..."
            className="min-h-[80px] resize-none flex-1 bg-background"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={isListening ? stopListening : startListening}
              className={isListening ? "bg-red-100" : ""}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
