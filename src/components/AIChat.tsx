import { useRef, useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export function AIChat() {
  const [isListening, setIsListening] = useState(false)
  const [message, setMessage] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)

  const cleanupAudioResources = () => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
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
            
            const { data, error } = await supabase.functions.invoke('eleven-labs-tts', {
              body: { text: transcript }
            })

            if (error) {
              console.error('Supabase function error:', error)
              throw error
            }

            // Clean up previous audio resources
            cleanupAudioResources()

            // Create a new blob from the audio data
            const audioBlob = new Blob([data], { type: 'audio/mpeg' })
            const audioUrl = URL.createObjectURL(audioBlob)
            audioUrlRef.current = audioUrl

            // Create and play the audio
            const audio = new Audio(audioUrl)
            audio.addEventListener('error', (e) => {
              console.error('Audio playback error:', e)
              toast.error('Failed to play audio response')
            })
            
            audio.addEventListener('ended', () => {
              console.log('Audio playback completed')
            })

            audioRef.current = audio
            await audio.play()
            console.log('Playing audio response')
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
      toast.error('Speech recognition error occurred')
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
    if (!isMuted) {
      cleanupAudioResources()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudioResources()
    }
  }, [])

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