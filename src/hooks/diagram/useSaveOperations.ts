
import React, { useCallback } from 'react';
import { useSupabaseJobs } from '@/hooks/useSupabaseJobs';

interface UseSaveOperationsProps {
  saveDataMemo: any;
  isInitialized: boolean;
  hasDataChanged: () => boolean;
  markAsSaved: () => void;
  setSaveInProgress: (inProgress: boolean) => void;
  isSaveInProgress: () => boolean;
  isInitialLoadComplete: () => boolean;
  forceSave: () => void;
  currentDataString: string;
}

export const useSaveOperations = ({
  saveDataMemo,
  isInitialized,
  hasDataChanged,
  markAsSaved,
  setSaveInProgress,
  isSaveInProgress,
  isInitialLoadComplete,
  forceSave,
  currentDataString,
}: UseSaveOperationsProps) => {
  const { saveJob } = useSupabaseJobs();

  const performSave = useCallback(() => {
    // Prevent multiple saves running simultaneously
    if (isSaveInProgress()) {
      console.log('Skipping save - save already in progress');
      return;
    }

    // Only save if data has actually changed and we're not in the initial load phase
    if (isInitialized && isInitialLoadComplete() && hasDataChanged()) {
      console.log('Performing enhanced save with debugging:', {
        nodesCount: saveDataMemo.nodes.length,
        edgesCount: saveDataMemo.edges.length,
        comPorts: {
          frac: saveDataMemo.fracComPort,
          gauge: saveDataMemo.gaugeComPort,
          fracBaud: saveDataMemo.fracBaudRate,
          gaugeBaud: saveDataMemo.gaugeBaudRate
        },
        edgeTypes: saveDataMemo.edges.map((e: any) => ({ id: e.id, type: e.type, connectionType: e.data?.connectionType }))
      });
      
      setSaveInProgress(true);
      markAsSaved();
      
      // Immediate save with enhanced debugging
      saveJob(saveDataMemo);
      setSaveInProgress(false);
    } else if (!isInitialLoadComplete()) {
      console.log('Skipping save - initial load not complete');
    } else if (!hasDataChanged()) {
      console.log('Skipping save - no data changes detected');
    } else if (!isInitialized) {
      console.log('Skipping save - not initialized yet');
    }
  }, [isInitialized, hasDataChanged, saveJob, saveDataMemo, setSaveInProgress, markAsSaved, isSaveInProgress, isInitialLoadComplete]);

  // Enhanced manual save function for user-triggered saves
  const manualSave = useCallback(() => {
    console.log('Manual save triggered with enhanced debugging');
    forceSave(); // Force save by clearing last saved data
    performSave();
  }, [performSave, forceSave]);

  // New immediate save function for critical user actions
  const immediateSave = useCallback(() => {
    console.log('Immediate save triggered for critical user action');
    if (isInitialized) {
      forceSave(); // Force save
      setSaveInProgress(true);
      saveJob(saveDataMemo);
      markAsSaved();
      setSaveInProgress(false);
    }
  }, [isInitialized, saveJob, saveDataMemo, forceSave, setSaveInProgress, markAsSaved]);

  return {
    performSave,
    manualSave,
    immediateSave,
  };
};
