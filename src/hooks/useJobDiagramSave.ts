
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
    // Preserve ALL edge data with enhanced data structure
    const preservedEdges = edges.map(edge => {
      const edgeData = {
        // Core edge properties
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type || 'cable',
        label: edge.label,
        animated: edge.animated || false,
        style: edge.style || {},
        
        // Enhanced data preservation
        data: {
          ...edge.data,
          // Ensure sourceHandle and targetHandle are preserved in data as well
          sourceHandle: edge.data?.sourceHandle || edge.sourceHandle,
          targetHandle: edge.data?.targetHandle || edge.targetHandle,
          // Preserve connection type and label
          connectionType: edge.data?.connectionType || (edge.type === 'direct' ? 'direct' : 'cable'),
          label: edge.data?.label || edge.label,
          // Preserve cable type if it exists
          cableTypeId: edge.data?.cableTypeId,
        },
      };

      console.log('Saving edge:', {
        id: edge.id,
        type: edgeData.type,
        connectionType: edgeData.data.connectionType,
        label: edgeData.data.label,
        sourceHandle: edgeData.sourceHandle,
        handles: {
          source: edge.sourceHandle,
          target: edge.targetHandle,
          dataSource: edge.data?.sourceHandle,
          dataTarget: edge.data?.targetHandle
        }
      });

      return edgeData;
    });

    // Preserve ALL node data with enhanced structure
    const preservedNodes = nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      style: node.style || {},
      draggable: node.draggable,
      deletable: node.deletable,
      data: {
        ...node.data,
        // Preserve all existing node data
        label: node.data?.label,
        color: node.data?.color,
        wellNumber: node.data?.wellNumber,
        boxNumber: node.data?.boxNumber,
        equipmentId: node.data?.equipmentId,
        assigned: node.data?.assigned,
        // Explicitly preserve COM port and baud rate settings
        fracBaudRate: node.data?.fracBaudRate,
        gaugeBaudRate: node.data?.gaugeBaudRate,
        fracComPort: node.data?.fracComPort,
        gaugeComPort: node.data?.gaugeComPort,
        // Preserve job reference
        jobId: job.id,
      },
    }));

    // Extract configuration data from MainBox nodes with better fallbacks
    const mainBoxNodes = preservedNodes.filter(node => node.type === 'mainBox');
    const primaryMainBox = mainBoxNodes[0]; // Use first MainBox as primary source
    
    const fracBaudRate = primaryMainBox?.data?.fracBaudRate || '19200';
    const gaugeBaudRate = primaryMainBox?.data?.gaugeBaudRate || '9600';
    const fracComPort = primaryMainBox?.data?.fracComPort || '';
    const gaugeComPort = primaryMainBox?.data?.gaugeComPort || '';

    console.log('Saving MainBox configuration:', {
      fracBaudRate,
      gaugeBaudRate,
      fracComPort,
      gaugeComPort,
      mainBoxCount: mainBoxNodes.length
    });

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
        connectionType: e.data?.connectionType,
        sourceHandle: e.sourceHandle || e.data?.sourceHandle,
        label: e.label || e.data?.label,
        style: e.style 
      })));
      console.log('MainBox settings being saved:', {
        fracComPort: saveDataMemo.fracComPort,
        gaugeComPort: saveDataMemo.gaugeComPort,
        fracBaudRate: saveDataMemo.fracBaudRate,
        gaugeBaudRate: saveDataMemo.gaugeBaudRate
      });
      
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

  const { debouncedSave, cleanup } = useDebouncedSave(performSave, 1000);

  // Mark initial load as complete after shorter delay
  useEffect(() => {
    if (isInitialized && !initialLoadCompleteRef.current) {
      const timer = setTimeout(() => {
        initialLoadCompleteRef.current = true;
        lastSavedDataRef.current = currentDataString;
        console.log('Initial load complete, ready for auto-save');
      }, 2000);

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
