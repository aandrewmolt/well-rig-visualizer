
import React, { useEffect } from 'react';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { useSaveDataPreparation } from '@/hooks/diagram/useSaveDataPreparation';
import { useSaveStateManager } from '@/hooks/diagram/useSaveStateManager';
import { useSaveOperations } from '@/hooks/diagram/useSaveOperations';

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
  extrasOnLocation?: any[];
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
  extrasOnLocation = [],
}: UseJobDiagramSaveProps) => {
  // Prepare save data
  const { saveDataMemo } = useSaveDataPreparation({
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
    selectedCustomerComputers,
    extrasOnLocation,
  });

  // Manage save state
  const {
    currentDataString,
    hasDataChanged,
    markAsSaved,
    setSaveInProgress,
    isSaveInProgress,
    setInitialLoadComplete,
    isInitialLoadComplete,
    forceSave,
  } = useSaveStateManager(saveDataMemo);

  // Save operations
  const {
    performSave,
    manualSave,
    immediateSave,
  } = useSaveOperations({
    saveDataMemo,
    isInitialized,
    hasDataChanged,
    markAsSaved,
    setSaveInProgress,
    isSaveInProgress,
    isInitialLoadComplete,
    forceSave,
    currentDataString,
  });

  // Reduced debounce delay for faster user feedback
  const { debouncedSave, cleanup } = useDebouncedSave(performSave, 500);

  // Mark initial load as complete after initialization
  useEffect(() => {
    if (isInitialized && !isInitialLoadComplete()) {
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
        markAsSaved();
        console.log('Initial load complete, ready for auto-save with enhanced debugging');
      }, 1000); // Reduced from 2000

      return () => clearTimeout(timer);
    }
  }, [isInitialized, currentDataString, setInitialLoadComplete, isInitialLoadComplete, markAsSaved]);

  // Trigger debounced save with enhanced debugging
  useEffect(() => {
    if (isInitialized && isInitialLoadComplete() && !isSaveInProgress()) {
      console.log('Triggering debounced save due to data change');
      debouncedSave();
    }
  }, [currentDataString, isInitialized, debouncedSave, isInitialLoadComplete, isSaveInProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    debouncedSave,
    manualSave,
    immediateSave,
    cleanup,
  };
};
