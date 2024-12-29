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
      localStorage.setItem('pendingAnnotation', JSON.stringify({
        ...annotationData,
        timestamp: Date.now()
      }))
      // Clear navigation state
      navigate(location.pathname, { replace: true })
    } else {
      // Fallback to localStorage
      const storedData = localStorage.getItem('pendingAnnotation')
      if (storedData) {
        try {
          console.log('Found stored annotation data:', storedData)
          annotationData = JSON.parse(storedData)
          // Verify data freshness (30 minute timeout)
          const timestamp = annotationData.timestamp
          if (timestamp && Date.now() - timestamp > 30 * 60 * 1000) {
            console.log('Annotation data expired')
            localStorage.removeItem('pendingAnnotation')
            annotationData = null
          } else {
            console.log('Using stored annotation data:', annotationData)
          }
        } catch (error) {
          console.error('Error parsing stored annotation data:', error)
          localStorage.removeItem('pendingAnnotation')
        }
      } else {
        console.log('No stored annotation data found')
      }
    }

    // Set form data if we have valid annotation data
    if (annotationData) {
      console.log('Setting form data from annotation:', annotationData)
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

    console.log('Starting tool submission process')
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
      console.log('Tool submission successful, navigating to initial-inventory')
      navigate('/initial-inventory')
    }
  }

  const handleCancel = () => {
    console.log('Form cancelled, keeping annotation data for later use')
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