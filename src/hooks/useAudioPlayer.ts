import { useRef, useCallback } from 'react'

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)

  const cleanupAudioResources = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }, [])

  const playAudio = useCallback(async (audioArrayBuffer: ArrayBuffer) => {
    cleanupAudioResources()

    const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/mpeg' })
    const audioUrl = URL.createObjectURL(audioBlob)
    audioUrlRef.current = audioUrl

    const audio = new Audio(audioUrl)
    audioRef.current = audio

    audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e)
      throw new Error('Failed to play audio response')
    })
    
    audio.addEventListener('ended', () => {
      console.log('Audio playback completed')
    })

    await audio.play()
    console.log('Playing audio response')
  }, [cleanupAudioResources])

  return {
    playAudio,
    cleanupAudioResources
  }
}