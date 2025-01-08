import { supabase } from '@/lib/supabase';

export const createAnnotation = async ({ toolId, photoId, coordinates }) => {
  const { data, error } = await supabase
    .from('annotations')
    .insert([
      {
        tool_id: toolId,
        photo_id: photoId,
        coordinates
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAnnotation = async ({ toolId, photoId, coordinates }) => {
  const { data, error } = await supabase
    .from('annotations')
    .update({
      coordinates
    })
    .match({
      tool_id: toolId,
      photo_id: photoId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
