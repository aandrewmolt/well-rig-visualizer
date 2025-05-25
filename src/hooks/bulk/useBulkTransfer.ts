
import { useCallback } from 'react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useAuditTrail } from '@/hooks/useAuditTrail';
import { BulkTransferParams } from '@/types/bulkOperations';
import { toast } from 'sonner';

export const useBulkTransfer = (
  createBulkOperation: (type: any, equipmentIds: string[], params: any) => string,
  updateOperationStatus: (operationId: string, status: any, error?: string) => void,
  setIsProcessing: (processing: boolean) => void
) => {
  const { data, updateEquipmentItems } = useInventoryData();
  const { addAuditEntry } = useAuditTrail();

  const bulkTransferEquipment = useCallback(async (
    equipmentTypeIds: string[],
    params: BulkTransferParams
  ) => {
    const operationId = createBulkOperation('transfer', equipmentTypeIds, params);
    setIsProcessing(true);

    try {
      const updatedItems = [...data.equipmentItems];
      let transferredCount = 0;

      for (const typeId of equipmentTypeIds) {
        const sourceItem = updatedItems.find(
          item => item.typeId === typeId && 
                 item.locationId === params.fromLocationId && 
                 item.status === 'available'
        );

        if (sourceItem && sourceItem.quantity >= params.quantity) {
          // Deduct from source
          sourceItem.quantity -= params.quantity;
          sourceItem.lastUpdated = new Date();

          // Add to destination
          const destItem = updatedItems.find(
            item => item.typeId === typeId && 
                   item.locationId === params.toLocationId && 
                   item.status === 'available'
          );

          if (destItem) {
            destItem.quantity += params.quantity;
            destItem.lastUpdated = new Date();
          } else {
            updatedItems.push({
              id: `bulk-transfer-${typeId}-${Date.now()}`,
              typeId,
              locationId: params.toLocationId,
              quantity: params.quantity,
              status: 'available',
              lastUpdated: new Date(),
            });
          }

          // Add audit entry
          addAuditEntry({
            action: 'transfer',
            entityType: 'equipment',
            entityId: typeId,
            details: {
              quantity: params.quantity,
              fromLocation: params.fromLocationId,
              toLocation: params.toLocationId,
              reason: 'Bulk transfer operation'
            },
            metadata: { source: 'manual' }
          });

          transferredCount++;
        }
      }

      updateEquipmentItems(updatedItems);
      updateOperationStatus(operationId, 'completed');
      toast.success(`Bulk transfer completed: ${transferredCount} equipment types moved`);
      
    } catch (error) {
      console.error('Bulk transfer failed:', error);
      updateOperationStatus(
        operationId, 
        'failed', 
        error instanceof Error ? error.message : 'Unknown error'
      );
      toast.error('Bulk transfer operation failed');
    } finally {
      setIsProcessing(false);
    }
  }, [data.equipmentItems, updateEquipmentItems, addAuditEntry, createBulkOperation, updateOperationStatus, setIsProcessing]);

  return {
    bulkTransferEquipment,
  };
};
