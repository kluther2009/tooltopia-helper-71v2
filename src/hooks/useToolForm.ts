import { useState, useRef, useEffect } from "react"
import { useToolManagement } from "@/hooks/useToolManagement"
import { useToolSubmission } from "@/components/tool/hooks/useToolSubmission"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export function useToolForm() {
  const navigate = useNavigate()
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
    const annotationData = localStorage.getItem('pendingAnnotation')
    if (annotationData) {
      try {
        const data = JSON.parse(annotationData)
        setPrimaryLocation(data.location || "")
        if (data.subLocation) {
          setSubLocation(data.subLocation)
        }
      } catch (error) {
        console.error('Error parsing annotation data:', error)
        localStorage.removeItem('pendingAnnotation')
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
      navigate('/initial-inventory')
    }
  }

  const handleCancel = () => {
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