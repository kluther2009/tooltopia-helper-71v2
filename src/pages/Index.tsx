import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"

export default function Index() {
  const navigate = useNavigate()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        navigate("/tools")
      } else {
        navigate("/login")
      }
    }

    checkSession()
  }, [navigate])

  return null // This component just handles redirection
}