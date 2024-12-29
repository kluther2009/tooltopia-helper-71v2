import { useState, useRef, useEffect } from "react"
import { useToolManagement } from "@/hooks/useToolManagement"
import { useToolSubmission } from "@/components/tool/hooks/useToolSubmission"
import { toast } from "sonner"
import { useNavigate, useLocation } from "react-router-dom"

export function useToolForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [toolName, setToolName] = useState("")
  const [primaryLocation, setPrimaryLocation] = useState("")
  const [subLocation, setSubLocation] = useState("")
  const [specificLocation, setSpecificLocation] = useState("")
  const [status, setStatus] = useState("available")
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false)
  const [purchaseDate, setPurchaseDate] = useState("")
  const [warrantyLength, setWarrantyLength] = useState("")
  const [purchaseCost, setPurchaseCost] = useState("")
  const [warrantyFile, setWarrantyFile] = useState<File | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  
  const toolNameInputRef = useRef<HTMLInputElement>(null)
  const { checkToolExists } = useToolManagement()
  const { handleToolSubmission, isUploading } = useToolSubmission()

  useEffect(() => {
    let annotationData = null

    // First check navigation state
    const state = location.state as { pendingAnnotation?: any }
    if (state?.pendingAnnotation) {
      console.log('Found annotation data in navigation state:', state.pendingAnnotation)
      annotationData = state.pendingAnnotation
      // Save to localStorage as backup
      localStorage.setItem('pendingAnnotation', JSON.stringify(annotationData))
      // Clear navigation state
      navigate(location.pathname, { replace: true })
    } else {
      // Fallback to localStorage
      const storedData = localStorage.getItem('pendingAnnotation')
      if (storedData) {
        try {
          annotationData = JSON.parse(storedData)
          // Verify data freshness (30 minute timeout)
          const timestamp = annotationData.timestamp
          if (timestamp && Date.now() - timestamp > 30 * 60 * 1000) {
            console.log('Annotation data expired')
            localStorage.removeItem('pendingAnnotation')
            annotationData = null
          }
        } catch (error) {
          console.error('Error parsing annotation data:', error)
          localStorage.removeItem('pendingAnnotation')
        }
      }
    }

    // Set form data if we have valid annotation data
    if (annotationData) {
      setPrimaryLocation(annotationData.location || "")
      if (annotationData.subLocation) {
        setSubLocation(annotationData.subLocation)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!toolName.trim()) {
      toast.error("Please enter a tool name")
      toolNameInputRef.current?.focus()
      return
    }

    const toolExists = await checkToolExists(toolName)
    if (toolExists) {
      toast.error("This tool already exists")
      toolNameInputRef.current?.focus()
      return
    }

    const success = await handleToolSubmission({
      toolName,
      primaryLocation,
      subLocation,
      specificLocation,
      status,
      showAdditionalInfo,
      purchaseDate,
      warrantyLength,
      purchaseCost,
      warrantyFile,
      receiptFile
    })

    if (success) {
      // Only clear localStorage after successful tool creation
      localStorage.removeItem('pendingAnnotation')
      navigate('/initial-inventory')
    }
  }

  const handleCancel = () => {
    // Keep annotation data in localStorage when canceling
    navigate('/initial-inventory')
  }

  return {
    formState: {
      toolName,
      primaryLocation,
      subLocation,
      specificLocation,
      status,
      showAdditionalInfo,
      purchaseDate,
      warrantyLength,
      purchaseCost,
      warrantyFile,
      receiptFile,
      isUploading
    },
    handlers: {
      setToolName,
      setPrimaryLocation,
      setSubLocation,
      setSpecificLocation,
      setStatus,
      setShowAdditionalInfo,
      setPurchaseDate,
      setWarrantyLength,
      setPurchaseCost,
      setWarrantyFile,
      setReceiptFile,
      handleSubmit,
      handleCancel
    },
    toolNameInputRef
  }
}
