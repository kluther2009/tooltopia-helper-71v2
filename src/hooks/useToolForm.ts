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

  // Store annotation data in state to preserve it
  const [annotationData, setAnnotationData] = useState<any>(null)

  useEffect(() => {
    // First check navigation state
    const state = location.state as { pendingAnnotation?: any }
    if (state?.pendingAnnotation) {
      console.log('Found annotation data in navigation state:', state.pendingAnnotation)
      setAnnotationData(state.pendingAnnotation)
      // Save to localStorage as backup
      localStorage.setItem('pendingAnnotation', JSON.stringify(state.pendingAnnotation))
    } else {
      // Fallback to localStorage
      const storedData = localStorage.getItem('pendingAnnotation')
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData)
          console.log('Found stored annotation data:', parsed)
          setAnnotationData(parsed)
          
          // Verify data freshness (30 minute timeout)
          const timestamp = parsed.timestamp
          if (timestamp && Date.now() - timestamp > 30 * 60 * 1000) {
            console.log('Annotation data expired')
            localStorage.removeItem('pendingAnnotation')
            setAnnotationData(null)
          }
        } catch (error) {
          console.error('Error parsing stored annotation data:', error)
          localStorage.removeItem('pendingAnnotation')
        }
      }
    }
  }, [location.state])

  useEffect(() => {
    if (annotationData) {
      console.log('Setting form data from annotation:', annotationData)
      setPrimaryLocation(annotationData.location || "")
      if (annotationData.subLocation) {
        setSubLocation(annotationData.subLocation)
      }
    }
  }, [annotationData])

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

    console.log('Starting tool submission with annotation data:', annotationData)
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
      receiptFile,
      annotationData // Pass the annotation data directly
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