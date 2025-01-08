import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToolSubmission } from '@/hooks/useToolSubmission';

interface ExistingToolUpdateProps {
  tool: {
    id: string;
    name: string;
    location: string;
    sub_location_a?: string;
  };
  annotationData: {
    photoId: string;
    coordinates: any;
    location: string;
    subLocation?: string;
  };
}

export function ExistingToolUpdate({ tool, annotationData }: ExistingToolUpdateProps) {
  const { handleToolUpdate, isUploading } = useToolSubmission();

  const handleUpdate = async () => {
    await handleToolUpdate({
      toolId: tool.id,
      location: annotationData.location,
      subLocation: annotationData.subLocation,
      annotationData: {
        photoId: annotationData.photoId,
        coordinates: annotationData.coordinates
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="text-yellow-400">
        This tool already exists at {tool.location} {tool.sub_location_a ? `> ${tool.sub_location_a}` : ''}.
        You can update its location or enter a different name.
      </div>
      <Button
        type="button"
        variant="warning"
        className="w-full"
        disabled={isUploading}
        onClick={handleUpdate}
      >
        {isUploading ? 'Updating...' : 'Update Existing Tool'}
      </Button>
    </div>
  );
}
