
import React, { useEffect, useMemo, useRef } from 'react';
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
  customerComputerNames: Record<string, string>;
  selectedCableType: string;
  selectedShearstreamBoxes: string[];
  selectedStarlink: string;
  selectedCustomerComputers: string[];
}

export const useJobDiagramSave = ({
  job,
  nodes,
  edges,
  isInitialized,
  mainBoxName,
  satelliteName,
  wellsideGaugeName,
  customerComputerNames,
  selectedCableType,
  selectedShearstreamBoxes,
  selectedStarlink,
  selectedCustomerComputers,
}: UseJobDiagramSaveProps) => {
  const { saveJob } = useSupabaseJobs();
  const lastSavedDataRef = useRef<string>('');
  const initialLoadCompleteRef = useRef(false);

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
      customerComputerNames,
      selectedCableType,
      equipmentAssignment: {
        shearstreamBoxIds: selectedShearstreamBoxes.filter(Boolean),
        starlinkId: selectedStarlink || undefined,
        customerComputerIds: selectedCustomerComputers.filter(Boolean),
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
    customerComputerNames,
    selectedCableType,
    selectedShearstreamBoxes,
    selectedStarlink,
    selectedCustomerComputers
  ]);

  // Create a stable string representation to detect actual changes
  const currentDataString = useMemo(() => {
    return JSON.stringify(saveDataMemo);
  }, [saveDataMemo]);

  const performSave = React.useCallback(() => {
    // Only save if data has actually changed and we're not in the initial load phase
    if (isInitialized && initialLoadCompleteRef.current && currentDataString !== lastSavedDataRef.current) {
      console.log('Performing save - data has changed');
      lastSavedDataRef.current = currentDataString;
      saveJob(saveDataMemo);
    } else if (!initialLoadCompleteRef.current) {
      console.log('Skipping save - initial load not complete');
    } else if (currentDataString === lastSavedDataRef.current) {
      console.log('Skipping save - no data changes detected');
    }
  }, [isInitialized, currentDataString, saveJob, saveDataMemo]);

  const { debouncedSave, cleanup } = useDebouncedSave(performSave, 1000); // Increased debounce time

  // Mark initial load as complete after a short delay
  useEffect(() => {
    if (isInitialized && !initialLoadCompleteRef.current) {
      const timer = setTimeout(() => {
        initialLoadCompleteRef.current = true;
        lastSavedDataRef.current = currentDataString;
        console.log('Initial load complete, ready for auto-save');
      }, 2000); // Wait 2 seconds after initialization to start auto-saving

      return () => clearTimeout(timer);
    }
  }, [isInitialized, currentDataString]);

  // Trigger debounced save only when there are actual changes
  useEffect(() => {
    if (isInitialized && initialLoadCompleteRef.current) {
      debouncedSave();
    }
  }, [currentDataString, isInitialized, debouncedSave]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    debouncedSave,
    cleanup,
  };
};
