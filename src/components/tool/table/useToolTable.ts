import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  manual_id: string | null;
}

interface SortConfig {
  key: keyof Tool;
  direction: 'asc' | 'desc';
}

export function useToolTable() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    const { data, error } = await supabase
      .from('tools')
      .select('*');

    if (error) {
      console.error('Error fetching tools:', error);
      return;
    }

    if (data) {
      setTools(data);
    }
  };

  const handleSort = (key: keyof Tool) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedTools = [...tools].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === null) return 1;
    if (bValue === null) return -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortConfig.direction === 'asc'
      ? (aValue < bValue ? -1 : 1)
      : (bValue < aValue ? -1 : 1);
  });

  const openFile = async (filePath: string) => {
    try {
      // Remove any leading slashes from the file path
      const cleanFilePath = filePath.replace(/^\/+/, '');
      
      const { data } = supabase.storage
        .from('warranty-files')
        .getPublicUrl(cleanFilePath);
      
      if (data.publicUrl) {
        console.log('Opening file:', data.publicUrl);
        window.open(data.publicUrl, '_blank');
      }
    } catch (error) {
      console.error('Error getting file URL:', error);
    }
  };

  return {
    tools: sortedTools,
    sortConfig,
    handleSort,
    openFile
  };
}