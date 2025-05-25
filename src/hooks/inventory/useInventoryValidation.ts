import { EquipmentItem } from '@/types/inventory';
import { toast } from 'sonner';
import { useInventoryDefaults } from './useInventoryDefaults';

export const useInventoryValidation = () => {
  const { DEFAULT_EQUIPMENT_TYPES } = useInventoryDefaults();

  const cleanupDuplicateDeployments = (items: EquipmentItem[]): EquipmentItem[] => {
    console.log('Cleaning up duplicate deployments...');
    const deploymentMap = new Map<string, EquipmentItem>();
    const cleanedItems: EquipmentItem[] = [];
    
    for (const item of items) {
      if (item.status === 'deployed' && item.jobId) {
        const deploymentKey = `${item.typeId}-${item.jobId}`;
        
        if (deploymentMap.has(deploymentKey)) {
          // Found duplicate - consolidate quantities
          const existing = deploymentMap.get(deploymentKey)!;
          console.log(`Consolidating duplicate deployment: ${deploymentKey} (${existing.quantity} + ${item.quantity})`);
          existing.quantity += item.quantity;
          existing.lastUpdated = new Date();
        } else {
          // First instance of this deployment
          deploymentMap.set(deploymentKey, { ...item });
        }
      } else {
        // Not a deployment - keep as is
        cleanedItems.push(item);
      }
    }
    
    // Add consolidated deployments
    deploymentMap.forEach(deployment => {
      cleanedItems.push(deployment);
    });
    
    const removedCount = items.length - cleanedItems.length;
    if (removedCount > 0) {
      console.log(`Removed ${removedCount} duplicate deployment records`);
      toast.info(`Cleaned up ${removedCount} duplicate equipment records`);
    }
    
    return cleanedItems;
  };

  const ensureMinimumInventory = (items: EquipmentItem[]): EquipmentItem[] => {
    const updatedItems = [...items];
    const midlandOfficeId = '1';
    
    // Ensure each equipment type has minimum quantity at Midland Office
    DEFAULT_EQUIPMENT_TYPES.forEach(type => {
      const existingItem = updatedItems.find(
        item => item.typeId === type.id && item.locationId === midlandOfficeId && item.status === 'available'
      );
      
      if (!existingItem) {
        // Create new item if none exists
        updatedItems.push({
          id: `auto-item-${type.id}-${Date.now()}`,
          typeId: type.id,
          locationId: midlandOfficeId,
          quantity: 25,
          status: 'available',
          lastUpdated: new Date(),
        });
      } else if (existingItem.quantity < 5) {
        // Top up if quantity is too low
        existingItem.quantity = Math.max(existingItem.quantity + 10, 15);
        existingItem.lastUpdated = new Date();
      }
    });
    
    return updatedItems;
  };

  return {
    cleanupDuplicateDeployments,
    ensureMinimumInventory,
  };
};
