import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useAIChat } from "@/hooks/useAIChat"
import { Loader2 } from "lucide-react"

export function AIChat() {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const { sendMessage, isLoading } = useAIChat()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const aiResponse = await sendMessage(message)
    if (aiResponse) {
      setResponse(aiResponse)
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Chat with AI Assistant</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={isLoading || !message.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Thinking...
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </form>
      {response && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">AI Response:</h3>
          <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
            {response}
          </div>
        </div>
      )}
    </Card>
  )
}