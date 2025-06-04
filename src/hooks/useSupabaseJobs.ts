
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
  companyComputerNames: Record<string, string>;
  equipmentAssignment: any;
  equipmentAllocated: boolean;
  mainBoxName: string;
  satelliteName: string;
  wellsideGaugeName: string;
  selectedCableType: string;
  fracBaudRate: string;
  gaugeBaudRate: string;
  fracComPort: string;
  gaugeComPort: string;
  enhancedConfig: any;
  createdAt: Date;
  updatedAt: Date;
}

export const useSupabaseJobs = () => {
  const queryClient = useQueryClient();
  let lastToastTime = 0;

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['supabase-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(job => ({
        id: job.id,
        name: job.name,
        wellCount: job.well_count,
        hasWellsideGauge: job.has_wellside_gauge,
        nodes: Array.isArray(job.nodes) ? job.nodes : [],
        edges: Array.isArray(job.edges) ? job.edges : [],
        companyComputerNames: (job.company_computer_names as Record<string, string>) || {},
        equipmentAssignment: job.equipment_assignment,
        equipmentAllocated: job.equipment_allocated,
        mainBoxName: job.main_box_name,
        satelliteName: job.satellite_name,
        wellsideGaugeName: job.wellside_gauge_name,
        selectedCableType: job.selected_cable_type,
        fracBaudRate: (job as any).frac_baud_rate || '19200',
        gaugeBaudRate: (job as any).gauge_baud_rate || '9600',
        fracComPort: (job as any).frac_com_port || '',
        gaugeComPort: (job as any).gauge_com_port || '',
        enhancedConfig: (job as any).enhanced_config || {},
        createdAt: new Date(job.created_at),
        updatedAt: new Date(job.updated_at),
      })) as JobDiagram[];
    }
  });

  const saveJobMutation = useMutation({
    mutationFn: async (jobData: Partial<JobDiagram>) => {
      const { data, error } = await supabase
        .from('jobs')
        .upsert({
          id: jobData.id,
          name: jobData.name,
          well_count: jobData.wellCount,
          has_wellside_gauge: jobData.hasWellsideGauge,
          nodes: jobData.nodes,
          edges: jobData.edges,
          company_computer_names: jobData.companyComputerNames,
          equipment_assignment: jobData.equipmentAssignment,
          equipment_allocated: jobData.equipmentAllocated,
          main_box_name: jobData.mainBoxName,
          satellite_name: jobData.satelliteName,
          wellside_gauge_name: jobData.wellsideGaugeName,
          selected_cable_type: jobData.selectedCableType,
          frac_baud_rate: jobData.fracBaudRate,
          gauge_baud_rate: jobData.gaugeBaudRate,
          frac_com_port: jobData.fracComPort,
          gauge_com_port: jobData.gaugeComPort,
          enhanced_config: jobData.enhancedConfig,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase-jobs'] });
      
      // Throttle success toasts to prevent spam (max one every 3 seconds)
      const now = Date.now();
      if (now - lastToastTime > 3000) {
        toast.success('Job saved successfully');
        lastToastTime = now;
      }
    },
    onError: (error) => {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase-jobs'] });
      toast.success('Job deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  });

  const saveJob = (jobData: Partial<JobDiagram>) => {
    saveJobMutation.mutate(jobData);
  };

  const deleteJob = (jobId: string) => {
    deleteJobMutation.mutate(jobId);
  };

  const getJobById = (jobId: string): JobDiagram | undefined => {
    return jobs.find(job => job.id === jobId);
  };

  return {
    jobs,
    isLoading,
    saveJob,
    deleteJob,
    getJobById,
  };
};
