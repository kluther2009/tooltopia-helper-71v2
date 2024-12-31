export const setupSpeechRecognition = (onResult: (transcript: string) => void, onError: (error: any) => void) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()
  
  recognition.continuous = false
  recognition.interimResults = false

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript
    console.log('Speech recognized:', transcript)
    onResult(transcript)
  }

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error)
    onError(event)
  }

  return recognition
}