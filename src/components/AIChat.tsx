// ... (keep existing imports)

export function AIChat() {
  // ... (keep existing state and refs)

  const playAudio = async (audioData: ArrayBuffer) => {
    try {
      // Create audio context for web audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Decode the array buffer
      const audioBuffer = await audioContext.decodeAudioData(audioData)
      
      // Create buffer source
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContext.destination)
      
      // Play the audio
      source.start(0)
      
      // Clean up
      source.onended = () => {
        source.disconnect()
        audioContext.close()
      }
    } catch (error) {
      console.error("Audio playback error:", error)
      toast.error("Failed to play audio")
    }
  }

  const recognitionRef.current.onresult = async (event: any) => {
    const transcript = event.results[0][0].transcript
    setMessage(transcript)
    
    if (!isMuted) {
      try {
        const { data, error } = await supabase.functions.invoke('eleven-labs-tts', {
          body: { text: transcript }
        })

        if (error) throw error

        // Play using Web Audio API
        await playAudio(data)
      } catch (error) {
        console.error("TTS error:", error)
        toast.error("Failed to convert text to speech")
      }
    }
  }

  // ... (keep rest of the component the same)
}