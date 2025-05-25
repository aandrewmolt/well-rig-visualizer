
import { useState, useCallback } from 'react';
import { useInventoryData, EquipmentItem, IndividualEquipment } from './useInventoryData';
import { useAuditTrail } from './useAuditTrail';
import { toast } from 'sonner';

interface BulkOperation {
  id: string;
  type: 'transfer' | 'deploy' | 'return' | 'update_status' | 'delete';
  equipmentIds: string[];
  params: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

interface BulkTransferParams {
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
}

interface BulkStatusUpdateParams {
  newStatus: 'available' | 'deployed' | 'red-tagged';
  reason?: string;
}

export const useBulkEquipmentOperations = () => {
  const { data, updateEquipmentItems, updateIndividualEquipment } = useInventoryData();
  const { addAuditEntry } = useAuditTrail();
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

      // Update operation status
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'completed' as const, completedAt: new Date() }
          : op
      ));

      toast.success(`Bulk transfer completed: ${transferredCount} equipment types moved`);
      
    } catch (error) {
      console.error('Bulk transfer failed:', error);
      
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { 
              ...op, 
              status: 'failed' as const, 
              error: error instanceof Error ? error.message : 'Unknown error',
              completedAt: new Date()
            }
          : op
      ));

      toast.error('Bulk transfer operation failed');
    } finally {
      setIsProcessing(false);
    }
  }, [data.equipmentItems, updateEquipmentItems, addAuditEntry, createBulkOperation]);

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

      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'completed' as const, completedAt: new Date() }
          : op
      ));

      toast.success(`Bulk status update completed: ${equipmentIds.length} items updated`);

    } catch (error) {
      console.error('Bulk status update failed:', error);
      
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { 
              ...op, 
              status: 'failed' as const, 
              error: error instanceof Error ? error.message : 'Unknown error',
              completedAt: new Date()
            }
          : op
      ));

      toast.error('Bulk status update failed');
    } finally {
      setIsProcessing(false);
    }
  }, [data.equipmentItems, updateEquipmentItems, addAuditEntry, createBulkOperation]);

  const getOperationHistory = useCallback(() => {
    return operations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [operations]);

  const clearCompletedOperations = useCallback(() => {
    setOperations(prev => prev.filter(op => op.status === 'pending' || op.status === 'processing'));
  }, []);

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
