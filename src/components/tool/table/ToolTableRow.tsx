import { format } from "date-fns";
import { FileText, Image } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Tool {
  id: string;
  name: string;
  location: string;
  sub_location_a: string | null;
  sub_location_b: string | null;
  status: string;
  purchase_date: string | null;
  warranty_length: number | null;
  warranty_file_path: string | null;
  receipt_file_path: string | null;
}

interface Annotation {
  id: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  photo: {
    file_path: string;
  } | null;
}

interface ToolTableRowProps {
  tool: Tool;
  onFileClick: (filePath: string) => void;
}

export function ToolTableRow({ tool, onFileClick }: ToolTableRowProps) {
  const [hasAnnotation, setHasAnnotation] = useState(false);
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);
  const [annotationData, setAnnotationData] = useState<Annotation | null>(null);
  const [annotationImage, setAnnotationImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    checkForAnnotations();
  }, [tool.id]);

  const checkForAnnotations = async () => {
    try {
      console.log('Fetching annotations for tool:', tool.id);
      const { data, error } = await supabase
        .from('tool_annotations')
        .select(`
          id,
          coordinates,
          photo:location_photos (
            file_path
          )
        `)
        .eq('tool_id', tool.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching annotations:', error);
        return;
      }

      if (data && data.photo) {
        console.log('Found annotation:', data);
        setHasAnnotation(true);
        setAnnotationData(data as Annotation);
      } else {
        console.log('No annotation found');
        setHasAnnotation(false);
        setAnnotationData(null);
      }
    } catch (error) {
      console.error('Error in checkForAnnotations:', error);
    }
  };

  const handleAnnotationClick = async () => {
    if (!annotationData?.photo?.file_path) {
      console.log('No photo file path available');
      return;
    }

    setIsImageLoading(true);
    setImageError(null);

    try {
      console.log('Getting public URL for:', annotationData.photo.file_path);
      const { data } = supabase.storage
        .from('location-photos')
        .getPublicUrl(annotationData.photo.file_path);

      if (data.publicUrl) {
        console.log('Public URL obtained:', data.publicUrl);
        setAnnotationImage(data.publicUrl);
        setIsAnnotationDialogOpen(true);
      }
    } catch (error) {
      console.error('Error getting image URL:', error);
      setImageError('Failed to load image');
    } finally {
      setIsImageLoading(false);
    }
  };

  const renderStatus = (status: string) => {
    const statusColors = {
      'available': 'bg-green-500',
      'in-use': 'bg-blue-500',
      'maintenance': 'bg-yellow-500'
    };

    return (
      <Badge 
        variant="secondary" 
        className={`${statusColors[status as keyof typeof statusColors]} text-white font-medium`}
      >
        {status}
      </Badge>
    );
  };

  return (
    <>
      <TableRow className="hover:bg-muted/50 transition-colors">
        <TableCell className="font-medium text-card-foreground">{tool.name}</TableCell>
        <TableCell className="text-card-foreground">{tool.location}</TableCell>
        <TableCell className="text-card-foreground">{tool.sub_location_a || '-'}</TableCell>
        <TableCell className="text-card-foreground">{tool.sub_location_b || '-'}</TableCell>
        <TableCell>{renderStatus(tool.status)}</TableCell>
        <TableCell className="text-card-foreground">
          {tool.purchase_date 
            ? format(new Date(tool.purchase_date), 'MM/dd/yyyy')
            : '-'}
        </TableCell>
        <TableCell className="text-card-foreground">
          {tool.warranty_length ? `${tool.warranty_length} months` : '-'}
        </TableCell>
        <TableCell>
          {tool.warranty_file_path && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFileClick(tool.warranty_file_path!)}
              className="hover:bg-muted"
            >
              <FileText className="h-4 w-4 text-primary" />
            </Button>
          )}
        </TableCell>
        <TableCell>
          {tool.receipt_file_path && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFileClick(tool.receipt_file_path!)}
              className="hover:bg-muted"
            >
              <FileText className="h-4 w-4 text-primary" />
            </Button>
          )}
        </TableCell>
        <TableCell>
          {hasAnnotation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAnnotationClick}
              className="hover:bg-muted"
            >
              <Image className="h-4 w-4 text-primary" />
            </Button>
          )}
        </TableCell>
      </TableRow>

      <Dialog open={isAnnotationDialogOpen} onOpenChange={setIsAnnotationDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Tool Location</DialogTitle>
          {isImageLoading && (
            <div className="text-center py-4">Loading image...</div>
          )}
          {imageError && (
            <div className="text-center text-red-500 py-4">{imageError}</div>
          )}
          {annotationImage && annotationData && !isImageLoading && (
            <div 
              className="relative overflow-hidden border border-gray-200 rounded-lg"
              style={{
                width: `${annotationData.coordinates.width}px`,
                height: `${annotationData.coordinates.height}px`,
              }}
            >
              <img 
                src={annotationImage} 
                alt="Tool annotation"
                className="absolute max-w-none"
                style={{
                  left: `-${annotationData.coordinates.x}px`,
                  top: `-${annotationData.coordinates.y}px`,
                }}
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  setImageError('Failed to load image');
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}