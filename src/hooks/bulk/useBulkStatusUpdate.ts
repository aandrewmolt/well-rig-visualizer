
import { useCallback } from 'react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useAuditTrail } from '@/hooks/useAuditTrail';
import { BulkStatusUpdateParams } from '@/types/bulkOperations';
import { toast } from 'sonner';

export const useBulkStatusUpdate = (
  createBulkOperation: (type: any, equipmentIds: string[], params: any) => string,
  updateOperationStatus: (operationId: string, status: any, error?: string) => void,
  setIsProcessing: (processing: boolean) => void
) => {
  const { data, updateEquipmentItems } = useInventoryData();
  const { addAuditEntry } = useAuditTrail();

  const bulkUpdateStatus = useCallback(async (
    equipmentIds: string[],
    params: BulkStatusUpdateParams
  ) => {
    const operationId = createBulkOperation('update_status', equipmentIds, params);
    setIsProcessing(true);

    try {
      const updatedItems = data.equipmentItems.map(item => {
        if (equipmentIds.includes(item.id)) {
          addAuditEntry({
            action: 'modify',
            entityType: 'equipment',
            entityId: item.typeId,
            details: {
              before: { status: item.status },
              after: { status: params.newStatus },
              reason: params.reason || 'Bulk status update'
            },
            metadata: { source: 'manual' }
          });

          return {
            ...item,
            status: params.newStatus,
            lastUpdated: new Date()
          };
        }
        return item;
      });

      updateEquipmentItems(updatedItems);
      updateOperationStatus(operationId, 'completed');
      toast.success(`Bulk status update completed: ${equipmentIds.length} items updated`);

    } catch (error) {
      console.error('Bulk status update failed:', error);
      updateOperationStatus(
        operationId, 
        'failed', 
        error instanceof Error ? error.message : 'Unknown error'
      );
      toast.error('Bulk status update failed');
    } finally {
      setIsProcessing(false);
    }
  }, [data.equipmentItems, updateEquipmentItems, addAuditEntry, createBulkOperation, updateOperationStatus, setIsProcessing]);

  return {
    bulkUpdateStatus,
  };
};
