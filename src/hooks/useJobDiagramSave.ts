
import React, { useEffect, useMemo } from 'react';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { useSupabaseJobs } from '@/hooks/useSupabaseJobs';
import { JobEquipmentAssignment } from '@/types/equipment';

interface Job {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  createdAt: Date;
}

interface UseJobDiagramSaveProps {
  job: Job;
  nodes: any[];
  edges: any[];
  isInitialized: boolean;
  mainBoxName: string;
  satelliteName: string;
  wellsideGaugeName: string;
  companyComputerNames: Record<string, string>;
  selectedCableType: string;
  selectedShearstreamBoxes: string[];
  selectedStarlink: string;
  selectedCompanyComputers: string[];
}

export const useJobDiagramSave = ({
  job,
  nodes,
  edges,
  isInitialized,
  mainBoxName,
  satelliteName,
  wellsideGaugeName,
  companyComputerNames,
  selectedCableType,
  selectedShearstreamBoxes,
  selectedStarlink,
  selectedCompanyComputers,
}: UseJobDiagramSaveProps) => {
  const { saveJob } = useSupabaseJobs();

  // Save data preparation with enhanced edge validation
  const saveDataMemo = useMemo(() => {
    // Validate and sanitize edges before saving
    const validatedEdges = edges.filter(edge => {
      const isValid = edge && 
                     typeof edge.id === 'string' && 
                     typeof edge.source === 'string' && 
                     typeof edge.target === 'string';
      
      if (!isValid) {
        console.warn('Invalid edge detected during save:', edge);
      }
      
      return isValid;
    }).map(edge => ({
      ...edge,
      // Ensure required properties exist
      type: edge.type || 'cable',
      data: edge.data || {},
      style: edge.style || {},
    }));

    console.log('Preparing save data with', validatedEdges.length, 'validated edges');

    return {
      id: job.id,
      name: job.name,
      wellCount: job.wellCount,
      hasWellsideGauge: job.hasWellsideGauge,
      nodes,
      edges: validatedEdges,
      mainBoxName,
      satelliteName,
      wellsideGaugeName,
      companyComputerNames,
      selectedCableType,
      equipmentAssignment: {
        shearstreamBoxIds: selectedShearstreamBoxes.filter(Boolean),
        starlinkId: selectedStarlink || undefined,
        companyComputerIds: selectedCompanyComputers.filter(Boolean),
      } as JobEquipmentAssignment,
      equipmentAllocated: true,
    };
  }, [
    job,
    nodes,
    edges,
    mainBoxName,
    satelliteName,
    wellsideGaugeName,
    companyComputerNames,
    selectedCableType,
    selectedShearstreamBoxes,
    selectedStarlink,
    selectedCompanyComputers
  ]);

  const performSave = React.useCallback(() => {
    if (isInitialized && (nodes.length > 0 || edges.length > 0)) {
      console.log('Saving job data to Supabase with edges:', saveDataMemo.edges.length);
      console.log('Edge details:', saveDataMemo.edges.map(e => ({ 
        id: e.id, 
        type: e.type, 
        source: e.source, 
        target: e.target,
        hasData: !!e.data,
        hasStyle: !!e.style 
      })));
      saveJob(saveDataMemo);
    }
  }, [isInitialized, nodes.length, edges.length, saveJob, saveDataMemo]);

  const { debouncedSave, cleanup } = useDebouncedSave(performSave, 300);

  // Trigger debounced save whenever relevant data changes
  useEffect(() => {
    if (isInitialized) {
      debouncedSave();
    }
  }, [saveDataMemo, isInitialized, debouncedSave]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    debouncedSave,
    cleanup,
  };
};
