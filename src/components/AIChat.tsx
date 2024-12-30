import { useRef, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export function AIChat() {
  const [isListening, setIsListening] = useState(false)
  const [message, setMessage] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const recognitionRef = useRef<any>(null)

  const playAudio = async (audioBlob: Blob) => {
    try {
      console.log('Creating audio URL from blob size:', audioBlob.size)
      
      // Upload the audio blob to Supabase storage
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to use this feature')
        return
      }

      const fileName = `${crypto.randomUUID()}.mp3`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('temp-audio')
        .upload(fileName, audioBlob)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error('Failed to upload audio file')
      }

      // Create a record in temp_audio_files table
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 5) // Expire in 5 minutes

      const { error: dbError } = await supabase
        .from('temp_audio_files')
        .insert({
          file_path: fileName,
          user_id: user.id,
          expires_at: expiresAt.toISOString()
        })

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error('Failed to save audio file record')
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = await supabase.storage
        .from('temp-audio')
        .createSignedUrl(fileName, 300) // 5 minutes expiry

      if (!urlData?.signedUrl) {
        throw new Error('Failed to get signed URL')
      }

      console.log('Created audio URL:', urlData.signedUrl)
      
      const audio = new Audio(urlData.signedUrl)
      
      audio.onerror = (e) => {
        console.error('Audio loading error:', e)
        toast.error('Failed to load audio')
      }
      
      await audio.play()
      
      // Cleanup will be handled by the database trigger
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
              body: { text: transcript }
            })

            if (response.error) throw response.error

            // Convert response data to Blob
            const audioBlob = new Blob([response.data], { type: 'audio/mpeg' })
            console.log('Created blob:', { blobSize: audioBlob.size, blobType: audioBlob.type })

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="space-y-4 w-full max-w-md">
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