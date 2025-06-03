
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

  // Save data preparation
  const saveDataMemo = useMemo(() => ({
    id: job.id,
    name: job.name,
    wellCount: job.wellCount,
    hasWellsideGauge: job.hasWellsideGauge,
    nodes,
    edges,
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
  }), [
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
      console.log('Saving job data to Supabase:', saveDataMemo);
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
