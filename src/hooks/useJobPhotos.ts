import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { optimizeImage } from '@/utils/imageOptimizer';

export interface JobPhoto {
  id: string;
  jobId: string;
  sectionLabel: string;
  photoUrl: string;
  caption?: string;
  sortOrder: number;
  createdAt: Date;
}

export const useJobPhotos = (jobId: string) => {
  const queryClient = useQueryClient();

  // Query for job photos
  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['job-photos', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_photos')
        .select('*')
        .eq('job_id', jobId)
        .order('section_label', { ascending: true })
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      return data.map(photo => ({
        id: photo.id,
        jobId: photo.job_id,
        sectionLabel: photo.section_label,
        photoUrl: photo.photo_url,
        caption: photo.caption || undefined,
        sortOrder: photo.sort_order,
        createdAt: new Date(photo.created_at),
      })) as JobPhoto[];
    }
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ file, sectionLabel, caption }: { 
      file: File; 
      sectionLabel: string; 
      caption?: string; 
    }) => {
      // Optimize image before upload
      console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      
      const optimizedFile = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        format: 'webp'
      });
      
      console.log('Optimized file size:', (optimizedFile.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('Size reduction:', (((file.size - optimizedFile.size) / file.size) * 100).toFixed(1), '%');
      
      // Generate unique filename with webp extension
      const fileExt = 'webp';
      const fileName = `${jobId}/${sectionLabel}/${Date.now()}.${fileExt}`;
      
      // Upload optimized file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('job-photos')
        .upload(fileName, optimizedFile);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('job-photos')
        .getPublicUrl(fileName);
      
      // Get next sort order for this section
      const existingPhotos = photos.filter(p => p.sectionLabel === sectionLabel);
      const nextSortOrder = existingPhotos.length > 0 
        ? Math.max(...existingPhotos.map(p => p.sortOrder)) + 1 
        : 0;
      
      // Save to database
      const { data, error } = await supabase
        .from('job_photos')
        .insert({
          job_id: jobId,
          section_label: sectionLabel,
          photo_url: publicUrl,
          caption,
          sort_order: nextSortOrder,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-photos', jobId] });
      toast.success('Photo uploaded and optimized successfully');
    },
    onError: (error) => {
      console.error('Failed to upload photo:', error);
      toast.error('Failed to upload photo');
    }
  });

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
    mutationFn: async ({ photoId, caption }: { photoId: string; caption: string }) => {
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

  // Group photos by section
  const photosBySection = photos.reduce((acc, photo) => {
    if (!acc[photo.sectionLabel]) {
      acc[photo.sectionLabel] = [];
    }
    acc[photo.sectionLabel].push(photo);
    return acc;
  }, {} as Record<string, JobPhoto[]>);

  const sections = Object.keys(photosBySection).sort();

  // Wrapper functions to match component interface expectations
  const uploadPhoto = (file: File, sectionLabel: string, caption?: string) => {
    uploadPhotoMutation.mutate({ file, sectionLabel, caption });
  };

  const deletePhoto = (photoId: string) => {
    deletePhotoMutation.mutate(photoId);
  };

  const updateCaption = (photoId: string, caption: string) => {
    updateCaptionMutation.mutate({ photoId, caption });
  };

  return {
    photos,
    photosBySection,
    sections,
    isLoading,
    uploadPhoto,
    deletePhoto,
    updateCaption,
    isUploading: uploadPhotoMutation.isPending,
    isDeleting: deletePhotoMutation.isPending,
  };
};
