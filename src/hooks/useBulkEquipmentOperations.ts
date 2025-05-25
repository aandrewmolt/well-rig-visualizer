
import { useBulkOperationManager } from './bulk/useBulkOperationManager';
import { useBulkTransfer } from './bulk/useBulkTransfer';
import { useBulkStatusUpdate } from './bulk/useBulkStatusUpdate';

export const useBulkEquipmentOperations = () => {
  const {
    operations,
    isProcessing,
    setIsProcessing,
    createBulkOperation,
    updateOperationStatus,
    getOperationHistory,
    clearCompletedOperations,
  } = useBulkOperationManager();

  const { bulkTransferEquipment } = useBulkTransfer(
    createBulkOperation,
    updateOperationStatus,
    setIsProcessing
  );

  const { bulkUpdateStatus } = useBulkStatusUpdate(
    createBulkOperation,
    updateOperationStatus,
    setIsProcessing
  );

  return {
    bulkTransferEquipment,
    bulkUpdateStatus,
    createBulkOperation,
    getOperationHistory,
    clearCompletedOperations,
    isProcessing,
    operations,
  };
};
