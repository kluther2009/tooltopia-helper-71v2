import { useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { setupSpeechRecognition } from '@/utils/speechRecognition'
import { convertTextToSpeech } from '@/utils/textToSpeech'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { useAIChat } from '@/hooks/useAIChat'
import { Textarea } from '@/components/ui/textarea'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

export function AIChat() {
  const [isListening, setIsListening] = useState(false)
  const [message, setMessage] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const recognitionRef = useRef<any>(null)
  const { playAudio, cleanupAudioResources } = useAudioPlayer()
  const { sendMessage, isLoading } = useAIChat()
  const navigate = useNavigate()

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

    // Listen for auth changes
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

  const handleListenToResponse = async () => {
    try {
      const audioArrayBuffer = await convertTextToSpeech(aiResponse)
      await playAudio(audioArrayBuffer)
    } catch (error) {
      console.error('TTS error:', error)
      toast.error('Failed to convert AI response to speech')
    }
  }

  const handleAskToolGuru = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message first')
      return
    }

    try {
      const response = await sendMessage(message)
      if (response) {
        setAiResponse(response)
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
    <div className="space-y-4">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message or use voice input..."
        className="min-h-[200px] bg-transparent border-2 border-white text-white placeholder:text-gray-400 resize-none"
      />
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`px-4 py-2 rounded ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-[#9b87f5] hover:bg-[#7E69AB]'
          } text-white`}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleAskToolGuru}
          disabled={isLoading}
          className="px-6 py-2 rounded bg-primary hover:bg-primary/90 text-white font-medium"
        >
          {isLoading ? 'Thinking...' : 'Ask ToolGuru'}
        </button>
      </div>
      {aiResponse && (
        <div className="space-y-4">
          <Textarea
            value={aiResponse}
            readOnly
            className="min-h-[200px] bg-transparent border-2 border-white text-white resize-none"
          />
          <div className="flex justify-center">
            <button
              onClick={handleListenToResponse}
              className="px-4 py-2 rounded bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
            >
              Listen to ToolGuru
            </button>
          </div>
        </div>
      )}
    </div>
  )
}