
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface JobDiagram {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  nodes: any[];
  edges: any[];
  mainBoxName?: string;
  satelliteName?: string;
  wellsideGaugeName?: string;
  companyComputerNames?: Record<string, string>;
  selectedCableType?: string;
  equipmentAssignment?: any;
  equipmentAllocated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const useSupabaseJobs = () => {
  const queryClient = useQueryClient();

  // Query for all jobs
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(job => ({
        id: job.id,
        name: job.name,
        wellCount: job.well_count,
        hasWellsideGauge: job.has_wellside_gauge,
        nodes: job.nodes || [],
        edges: job.edges || [],
        mainBoxName: job.main_box_name || undefined,
        satelliteName: job.satellite_name || undefined,
        wellsideGaugeName: job.wellside_gauge_name || undefined,
        companyComputerNames: job.company_computer_names as Record<string, string> || {},
        selectedCableType: job.selected_cable_type || undefined,
        equipmentAssignment: job.equipment_assignment || undefined,
        equipmentAllocated: job.equipment_allocated || false,
        createdAt: new Date(job.created_at),
        updatedAt: new Date(job.updated_at),
      })) as JobDiagram[];
    }
  });

  // Mutation for saving/updating jobs
  const saveJobMutation = useMutation({
    mutationFn: async (jobData: Partial<JobDiagram> & { id?: string }) => {
      const jobPayload = {
        name: jobData.name,
        well_count: jobData.wellCount,
        has_wellside_gauge: jobData.hasWellsideGauge,
        nodes: jobData.nodes || [],
        edges: jobData.edges || [],
        main_box_name: jobData.mainBoxName,
        satellite_name: jobData.satelliteName,
        wellside_gauge_name: jobData.wellsideGaugeName,
        company_computer_names: jobData.companyComputerNames || {},
        selected_cable_type: jobData.selectedCableType,
        equipment_assignment: jobData.equipmentAssignment,
        equipment_allocated: jobData.equipmentAllocated || false,
      };

      if (jobData.id) {
        // Update existing job
        const { data, error } = await supabase
          .from('jobs')
          .update(jobPayload)
          .eq('id', jobData.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new job
        const { data, error } = await supabase
          .from('jobs')
          .insert(jobPayload)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job saved successfully');
    },
    onError: (error) => {
      console.error('Failed to save job:', error);
      toast.error('Failed to save job');
    }
  });

  // Mutation for deleting jobs
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete job:', error);
      toast.error('Failed to delete job');
    }
  });

  const saveJob = (jobData: Partial<JobDiagram> & { id?: string }) => {
    saveJobMutation.mutate(jobData);
  };

  const deleteJob = (jobId: string) => {
    deleteJobMutation.mutate(jobId);
  };

  const getJobById = (jobId: string) => {
    return jobs.find(job => job.id === jobId);
  };

  return {
    jobs,
    isLoading,
    error,
    saveJob,
    deleteJob,
    getJobById,
    isJobLoading: saveJobMutation.isPending || deleteJobMutation.isPending,
  };
};
