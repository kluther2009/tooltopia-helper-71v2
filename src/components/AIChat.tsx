import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAIChat } from "@/hooks/useAIChat"
import { Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { useConversation } from "@11labs/react"
import { toast } from "sonner"
import { ElevenLabsClient } from '@11labs/react'
ElevenLabsClient.init('sk_2ff05cfbe7aaee3b41d5a8e5a5cf006fa78dcb3046a4ec1b')  // Replace with actual API key

declare global {
 interface Window {
   webkitSpeechRecognition: any;
   SpeechRecognition: any;
 }
}

export function AIChat() {
 const [message, setMessage] = useState("")
 const [response, setResponse] = useState("")
 const [isListening, setIsListening] = useState(false)
 const [isMuted, setIsMuted] = useState(false)
 const { sendMessage, isLoading } = useAIChat()
 
 const conversation = useConversation({
   onConnect: () => {
     console.log("Connected to ElevenLabs successfully")
     toast.success("Voice chat connected")
   },
   onDisconnect: () => {
     console.log("Disconnected from ElevenLabs")
     setIsListening(false)
   },
   onError: (error: any) => {
     console.error("ElevenLabs error:", error)
     toast.error("Voice chat error occurred")
     setIsListening(false)
   },
   onMessage: (message) => {
     console.log("Message received:", message)
   },
   overrides: {
     agent: {
       language: "en",
       prompt: {
         prompt: "You are ToolGuru, a helpful AI assistant focused on tools and organization."
       }
     },
     tts: {
       voiceId: "IKne3meq5aSn9XLyUdCD",
     },
   },
 })

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault()
   if (!message.trim()) return

   const aiResponse = await sendMessage(message)
   if (aiResponse) {
     setResponse(aiResponse)
     if (!isMuted) {
       try {
         console.log("Starting ElevenLabs session...")
         const session = await conversation.startSession({
           agentId: "default",
           overrides: {
             agent: {
               firstMessage: aiResponse,
               language: "en"
             },
             tts: {
               voiceId: "IKne3meq5aSn9XLyUdCD"
             }
           },
         })
         
         if (!session.isConnected) {
           await session.connect()
         }
         await session.sendTextMessage(aiResponse)
         console.log("ElevenLabs session started:", session)
         
       } catch (error) {
         console.error("TTS error:", error)
         toast.error("Text-to-speech error occurred. Please try again.")
       }
     }
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

 const toggleMute = () => {
   setIsMuted(!isMuted)
   if (conversation) {
     conversation.setVolume({ volume: isMuted ? 1 : 0 })
     toast.success(isMuted ? "Voice unmuted" : "Voice muted")
   }
 }

 return (
   <div className="space-y-4">
     <form onSubmit={handleSubmit} className="space-y-4">
       <div className="flex gap-2">
         <Textarea
           value={message}
           onChange={(e) => setMessage(e.target.value)}
           placeholder="Ask me anything about tools, maintenance, or organization..."
           className="min-h-[100px] resize-none flex-1"
         />
         <div className="flex flex-col gap-2">
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
           <Button
             type="button"
             variant="outline"
             size="icon"
             onClick={toggleMute}
           >
             {isMuted ? (
               <VolumeX className="h-4 w-4" />
             ) : (
               <Volume2 className="h-4 w-4" />
             )}
           </Button>
         </div>
       </div>
       <Button type="submit" disabled={isLoading || !message.trim()}>
         {isLoading ? (
           <>
             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             Thinking...
           </>
         ) : (
           "Ask ToolGuru"
         )}
       </Button>
     </form>
     {response && (
       <div className="mt-4">
         <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">
           {response}
         </div>
       </div>
     )}
   </div>
 )
}
