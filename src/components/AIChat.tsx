import { useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { setupSpeechRecognition } from '@/utils/speechRecognition'
import { convertTextToSpeech } from '@/utils/textToSpeech'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'

export function AIChat() {
  const [isListening, setIsListening] = useState(false)
  const [message, setMessage] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const recognitionRef = useRef<any>(null)
  const { playAudio, cleanupAudioResources } = useAudioPlayer()

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

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      cleanupAudioResources()
    }
  }

  useEffect(() => {
    return () => {
      cleanupAudioResources()
    }
  }, [cleanupAudioResources])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
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
        <button
          onClick={toggleMute}
          className={`px-4 py-2 rounded ${
            isMuted 
              ? 'bg-gray-500 hover:bg-gray-600' 
              : 'bg-[#9b87f5] hover:bg-[#7E69AB]'
          } text-white`}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
      {message && (
        <p className="text-white">{message}</p>
      )}
    </div>
  )
}