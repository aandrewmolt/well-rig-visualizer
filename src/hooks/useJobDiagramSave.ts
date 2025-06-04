
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

  // Enhanced save data preparation with complete edge preservation
  const saveDataMemo = useMemo(() => {
    // Preserve ALL edge data without validation during save
    const preservedEdges = edges.map(edge => ({
      ...edge,
      // Ensure all edge properties are preserved
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type || 'cable',
      data: {
        ...edge.data,
        // Preserve sourceHandle in data as backup
        sourceHandle: edge.data?.sourceHandle || edge.sourceHandle,
        targetHandle: edge.data?.targetHandle || edge.targetHandle,
      },
      style: edge.style || {},
      label: edge.label,
      animated: edge.animated,
    }));

    // Preserve ALL node data including colors, positions, and custom properties
    const preservedNodes = nodes.map(node => ({
      ...node,
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        ...node.data,
        // Preserve all node data properties
        label: node.data?.label,
        color: node.data?.color,
        wellNumber: node.data?.wellNumber,
        boxNumber: node.data?.boxNumber,
        equipmentId: node.data?.equipmentId,
        assigned: node.data?.assigned,
        fracBaudRate: node.data?.fracBaudRate,
        gaugeBaudRate: node.data?.gaugeBaudRate,
        fracComPort: node.data?.fracComPort,
        gaugeComPort: node.data?.gaugeComPort,
      },
      style: node.style || {},
      draggable: node.draggable,
      deletable: node.deletable,
    }));

    // Extract configuration data from MainBox nodes
    const mainBoxNode = preservedNodes.find(node => node.type === 'mainBox');
    const fracBaudRate = mainBoxNode?.data?.fracBaudRate || '19200';
    const gaugeBaudRate = mainBoxNode?.data?.gaugeBaudRate || '9600';
    const fracComPort = mainBoxNode?.data?.fracComPort || '';
    const gaugeComPort = mainBoxNode?.data?.gaugeComPort || '';

    return {
      id: job.id,
      name: job.name,
      wellCount: job.wellCount,
      hasWellsideGauge: job.hasWellsideGauge,
      nodes: preservedNodes,
      edges: preservedEdges,
      mainBoxName,
      satelliteName,
      wellsideGaugeName,
      customerComputerNames,
      selectedCableType,
      fracBaudRate,
      gaugeBaudRate,
      fracComPort,
      gaugeComPort,
      equipmentAssignment: {
        shearstreamBoxIds: selectedShearstreamBoxes.filter(Boolean),
        starlinkId: selectedStarlink || undefined,
        customerComputerIds: selectedCustomerComputers.filter(Boolean),
      } as JobEquipmentAssignment,
      equipmentAllocated: true,
      lastSaved: new Date().toISOString(),
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
      console.log('Saving nodes count:', saveDataMemo.nodes.length);
      console.log('Saving edges count:', saveDataMemo.edges.length);
      console.log('Edge details being saved:', saveDataMemo.edges.map(e => ({ 
        id: e.id, 
        type: e.type, 
        sourceHandle: e.sourceHandle || e.data?.sourceHandle,
        label: e.label,
        style: e.style 
      })));
      
      saveInProgressRef.current = true;
      lastSavedDataRef.current = currentDataString;
      
      // Immediate save without delay
      saveJob(saveDataMemo);
      saveInProgressRef.current = false;
    } else if (!initialLoadCompleteRef.current) {
      console.log('Skipping save - initial load not complete');
    } else if (currentDataString === lastSavedDataRef.current) {
      console.log('Skipping save - no data changes detected');
    }
  }, [isInitialized, currentDataString, saveJob, saveDataMemo]);

  const { debouncedSave, cleanup } = useDebouncedSave(performSave, 1000); // Reduced to 1 second

  // Mark initial load as complete after shorter delay
  useEffect(() => {
    if (isInitialized && !initialLoadCompleteRef.current) {
      const timer = setTimeout(() => {
        initialLoadCompleteRef.current = true;
        lastSavedDataRef.current = currentDataString;
        console.log('Initial load complete, ready for auto-save');
      }, 2000); // Reduced to 2 seconds

      return () => clearTimeout(timer);
    }
  }, [isInitialized, currentDataString]);

  // Trigger debounced save
  useEffect(() => {
    if (isInitialized && initialLoadCompleteRef.current && !saveInProgressRef.current) {
      debouncedSave();
    }
  }, [currentDataString, isInitialized, debouncedSave]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Manual save function for user-triggered saves
  const manualSave = React.useCallback(() => {
    console.log('Manual save triggered');
    lastSavedDataRef.current = ''; // Force save by clearing last saved data
    performSave();
  }, [performSave]);

  return {
    debouncedSave,
    manualSave,
    cleanup,
  };
};
