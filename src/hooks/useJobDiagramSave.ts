
import React, { useEffect, useMemo } from 'react';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { useJobPersistence } from '@/hooks/useJobPersistence';
import { useJobStorage } from '@/hooks/useJobStorage';
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
  const { updateJob } = useJobStorage();
  const { saveJobData } = useJobPersistence(job.id);

  // Save data preparation
  const saveDataMemo = useMemo(() => ({
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
      saveJobData(saveDataMemo);
      updateJob(job.id, { 
        equipmentAllocated: true,
        lastUpdated: new Date() 
      });
    }
  }, [isInitialized, nodes.length, edges.length, saveJobData, saveDataMemo, updateJob, job.id]);

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
