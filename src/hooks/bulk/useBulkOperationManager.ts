
import { useState, useCallback } from 'react';
import { BulkOperation } from '@/types/bulkOperations';

export const useBulkOperationManager = () => {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const createBulkOperation = useCallback((
    type: BulkOperation['type'],
    equipmentIds: string[],
    params: Record<string, any>
  ): string => {
    const operation: BulkOperation = {
      id: `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      equipmentIds,
      params,
      status: 'pending',
      createdAt: new Date(),
    };

    setOperations(prev => [...prev, operation]);
    return operation.id;
  }, []);

  const updateOperationStatus = useCallback((
    operationId: string,
    status: BulkOperation['status'],
    error?: string
  ) => {
    setOperations(prev => prev.map(op => 
      op.id === operationId 
        ? { 
            ...op, 
            status,
            error,
            completedAt: status === 'completed' || status === 'failed' ? new Date() : undefined
          }
        : op
    ));
  }, []);

  const getOperationHistory = useCallback(() => {
    return operations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [operations]);

  const clearCompletedOperations = useCallback(() => {
    setOperations(prev => prev.filter(op => op.status === 'pending' || op.status === 'processing'));
  }, []);

  return {
    operations,
    isProcessing,
    setIsProcessing,
    createBulkOperation,
    updateOperationStatus,
    getOperationHistory,
    clearCompletedOperations,
  };
};
