
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { JobPhoto, UpdateCaptionParams } from './types';

export const useJobPhotoMutations = (jobId: string, photos: JobPhoto[]) => {
  const queryClient = useQueryClient();

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const photo = photos.find(p => p.id === photoId);
      if (!photo) throw new Error('Photo not found');
      
      // Extract file path from URL
      const urlParts = photo.photoUrl.split('/');
      const filePath = urlParts.slice(-3).join('/'); // Get last 3 parts: jobId/section/filename
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('job-photos')
        .remove([filePath]);
      
      if (storageError) throw storageError;
      
      // Delete from database
      const { error } = await supabase
        .from('job_photos')
        .delete()
        .eq('id', photoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-photos', jobId] });
      toast.success('Photo deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete photo:', error);
      toast.error('Failed to delete photo');
    }
  });

  // Update caption mutation
  const updateCaptionMutation = useMutation({
    mutationFn: async ({ photoId, caption }: UpdateCaptionParams) => {
      const { error } = await supabase
        .from('job_photos')
        .update({ caption })
        .eq('id', photoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-photos', jobId] });
      toast.success('Caption updated');
    },
    onError: (error) => {
      console.error('Failed to update caption:', error);
      toast.error('Failed to update caption');
    }
  });

  return {
    deletePhoto: (photoId: string) => {
      deletePhotoMutation.mutate(photoId);
    },
    updateCaption: (photoId: string, caption: string) => {
      updateCaptionMutation.mutate({ photoId, caption });
    },
    isDeleting: deletePhotoMutation.isPending,
  };
};
