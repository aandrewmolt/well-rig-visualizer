
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseJobs = () => {
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
        nodes: job.nodes,
        edges: job.edges,
        companyComputerNames: job.company_computer_names,
        equipmentAssignment: job.equipment_assignment,
        equipmentAllocated: job.equipment_allocated,
        mainBoxName: job.main_box_name,
        satelliteName: job.satellite_name,
        wellsideGaugeName: job.wellside_gauge_name,
        selectedCableType: job.selected_cable_type,
        createdAt: new Date(job.created_at),
        updatedAt: new Date(job.updated_at),
      }));
    }
  });

  return {
    jobs,
    isLoading,
  };
};
