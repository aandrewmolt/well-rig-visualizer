
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
  const saveInProgressRef = useRef(false);

  // Save data preparation with enhanced edge validation and configuration data
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

    // Extract baud rates and COM ports from MainBox nodes
    const mainBoxNode = nodes.find(node => node.type === 'mainBox');
    const fracBaudRate = mainBoxNode?.data?.fracBaudRate || '19200';
    const gaugeBaudRate = mainBoxNode?.data?.gaugeBaudRate || '9600';
    const fracComPort = mainBoxNode?.data?.fracComPort || '';
    const gaugeComPort = mainBoxNode?.data?.gaugeComPort || '';

    // Create enhanced config object with all current settings
    const enhancedConfig = {
      nodePositions: nodes.map(node => ({
        id: node.id,
        position: node.position,
        data: node.data,
        style: node.style
      })),
      edgeStyles: validatedEdges.map(edge => ({
        id: edge.id,
        style: edge.style,
        data: edge.data
      })),
      lastSaved: new Date().toISOString(),
      version: '1.0'
    };

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
      fracBaudRate,
      gaugeBaudRate,
      fracComPort,
      gaugeComPort,
      enhancedConfig,
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
    // Prevent multiple saves running simultaneously
    if (saveInProgressRef.current) {
      console.log('Skipping save - save already in progress');
      return;
    }

    // Only save if data has actually changed and we're not in the initial load phase
    if (isInitialized && initialLoadCompleteRef.current && currentDataString !== lastSavedDataRef.current) {
      console.log('Performing save - data has changed');
      saveInProgressRef.current = true;
      lastSavedDataRef.current = currentDataString;
      
      // Add a small delay to ensure UI interactions complete
      setTimeout(() => {
        saveJob(saveDataMemo);
        saveInProgressRef.current = false;
      }, 100);
    } else if (!initialLoadCompleteRef.current) {
      console.log('Skipping save - initial load not complete');
    } else if (currentDataString === lastSavedDataRef.current) {
      console.log('Skipping save - no data changes detected');
    }
  }, [isInitialized, currentDataString, saveJob, saveDataMemo]);

  const { debouncedSave, cleanup } = useDebouncedSave(performSave, 3000); // Increased delay to 3 seconds

  // Mark initial load as complete after a longer delay to ensure data loading is finished
  useEffect(() => {
    if (isInitialized && !initialLoadCompleteRef.current) {
      const timer = setTimeout(() => {
        initialLoadCompleteRef.current = true;
        lastSavedDataRef.current = currentDataString;
        console.log('Initial load complete, ready for auto-save');
      }, 5000); // Increased delay to 5 seconds to allow proper data loading

      return () => clearTimeout(timer);
    }
  }, [isInitialized, currentDataString]);

  // Trigger debounced save - ALWAYS call this useEffect
  useEffect(() => {
    if (isInitialized && initialLoadCompleteRef.current && !saveInProgressRef.current) {
      debouncedSave();
    }
  }, [currentDataString, isInitialized, debouncedSave]);

  // Cleanup on unmount - ALWAYS call this useEffect
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    debouncedSave,
    cleanup,
  };
};
