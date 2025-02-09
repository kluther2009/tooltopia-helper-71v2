
import { useState, useRef, useEffect } from "react"
import { useToolManagement } from "@/hooks/useToolManagement"
import { useToolSubmission } from "@/components/tool/hooks/useToolSubmission"
import { toast } from "sonner"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"

export function useToolForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [toolName, setToolName] = useState("")
  const [primaryLocation, setPrimaryLocation] = useState("")
  const [subLocation, setSubLocation] = useState("")
  const [specificLocation, setSpecificLocation] = useState("")
  const [status, setStatus] = useState("available")
  const [loanedTo, setLoanedTo] = useState("")
  const [loanDate, setLoanDate] = useState("")
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false)
  const [showMaintenanceInfo, setShowMaintenanceInfo] = useState(false)
  const [purchaseDate, setPurchaseDate] = useState("")
  const [warrantyLength, setWarrantyLength] = useState("")
  const [purchaseCost, setPurchaseCost] = useState("")
  const [warrantyFile, setWarrantyFile] = useState<File | null>(null)
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState("")
  const [maintenancePeriod, setMaintenancePeriod] = useState("")
  const [manualId, setManualId] = useState<string | null>(null)
  
  const toolNameInputRef = useRef<HTMLInputElement>(null)
  const { checkToolExists } = useToolManagement()
  const { handleToolSubmission, isUploading } = useToolSubmission()

  // Store annotation data in state
  const [annotationData, setAnnotationData] = useState<any>(null)

  useEffect(() => {
    const fetchTemporaryAnnotation = async () => {
      try {
        console.log('Fetching temporary annotation...');
        const { data: tempAnnotation, error } = await supabase
          .from('temporary_annotations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching temporary annotation:', error);
          return;
        }

        if (tempAnnotation) {
          console.log('Found temporary annotation:', tempAnnotation);
          setAnnotationData(tempAnnotation);
          setPrimaryLocation(tempAnnotation.location || "");
          if (tempAnnotation.sub_location) {
            setSubLocation(tempAnnotation.sub_location);
          }
        } else {
          console.log('No temporary annotation found');
        }
      } catch (error) {
        console.error('Error in fetchTemporaryAnnotation:', error);
      }
    }

    fetchTemporaryAnnotation();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!toolName.trim()) {
      toast.error("Please enter a tool name");
      toolNameInputRef.current?.focus();
      return;
    }

    if (status === "loaned" && (!loanedTo.trim() || !loanDate)) {
      toast.error("Please fill in both 'Loaned To' and 'Loan Date' fields");
      return;
    }

    const toolExists = await checkToolExists(toolName);
    if (toolExists) {
      toast.error("This tool already exists");
      toolNameInputRef.current?.focus();
      return;
    }

    console.log('Starting tool submission with annotation data:', annotationData);
    const success = await handleToolSubmission({
      toolName,
      primaryLocation,
      subLocation,
      specificLocation,
      status,
      loanedTo: status === "loaned" ? loanedTo : null,
      loanDate: status === "loaned" ? loanDate : null,
      showAdditionalInfo,
      purchaseDate,
      warrantyLength,
      purchaseCost,
      warrantyFile,
      lastMaintenanceDate,
      maintenancePeriod,
      annotationData,
      manualId
    });

    if (success) {
      // Clean up temporary annotation
      if (annotationData?.id) {
        const { error: deleteError } = await supabase
          .from('temporary_annotations')
          .delete()
          .eq('id', annotationData.id);

        if (deleteError) {
          console.error('Error deleting temporary annotation:', deleteError);
        }
      }

      console.log('Tool submission successful, navigating to initial-inventory');
      navigate('/initial-inventory');
    }
  };

  const handleCancel = () => {
    console.log('Form cancelled');
    navigate('/initial-inventory');
  };

  return {
    formState: {
      toolName,
      primaryLocation,
      subLocation,
      specificLocation,
      status,
      loanedTo,
      loanDate,
      showAdditionalInfo,
      showMaintenanceInfo,
      purchaseDate,
      warrantyLength,
      purchaseCost,
      warrantyFile,
      lastMaintenanceDate,
      maintenancePeriod,
      isUploading,
      manualId
    },
    handlers: {
      setToolName,
      setPrimaryLocation,
      setSubLocation,
      setSpecificLocation,
      setStatus,
      setLoanedTo,
      setLoanDate,
      setShowAdditionalInfo,
      setShowMaintenanceInfo,
      setPurchaseDate,
      setWarrantyLength,
      setPurchaseCost,
      setWarrantyFile,
      setLastMaintenanceDate,
      setMaintenancePeriod,
      handleSubmit,
      handleCancel,
      setManualId
    },
    toolNameInputRef
  };
}
