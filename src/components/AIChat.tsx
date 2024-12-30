import { useRef, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export function AIChat() {
  const [isListening, setIsListening] = useState(false)
  const [message, setMessage] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playAudio = async (audioData: Blob) => {
    try {
      // Create a new audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio()
      }

      // Create URL from blob directly
      const url = URL.createObjectURL(audioData)
      
      // Set up audio element
      audioRef.current.src = url
      
      // Set up error handling
      audioRef.current.onerror = (e) => {
        console.error('Audio loading error:', e)
        toast.error('Failed to load audio')
        URL.revokeObjectURL(url)
      }

      // Play the audio
      await audioRef.current.play()
      
      // Clean up when done
      audioRef.current.onended = () => {
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Audio playback error:', error)
      toast.error('Failed to play audio')
    }
  }

  const startListening = () => {
    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript
        setMessage(transcript)
        console.log('Speech recognized:', transcript)
        
        if (!isMuted) {
          try {
            console.log('Calling eleven-labs-tts with text:', transcript)
            
            const response = await supabase.functions.invoke('eleven-labs-tts', {
              body: { text: transcript },
              headers: {
                'Accept': 'audio/mpeg'
              }
            })

            if (response.error) throw response.error

            // Get the response as a blob directly
            const audioBlob = new Blob([response.data], { type: 'audio/mpeg' })
            await playAudio(audioBlob)
          } catch (error) {
            console.error('TTS error:', error)
            toast.error('Failed to convert text to speech')
          }
        }
      }
    }

    recognitionRef.current.start()
    setIsListening(true)

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4"
      aria-describedby="ai-chat-description"
    >
      <div className="space-y-4 w-full max-w-md">
        <p id="ai-chat-description" className="sr-only">
          AI Chat interface for voice interaction and text-to-speech responses
        </p>
        <div className="flex justify-between items-center">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`px-4 py-2 rounded ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </button>
          <button
            onClick={toggleMute}
            className={`px-4 py-2 rounded ${
              isMuted 
                ? 'bg-gray-500 hover:bg-gray-600' 
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        </div>
        {message && (
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-700">{message}</p>
          </div>
        )}
      </div>
    </div>
  )
}