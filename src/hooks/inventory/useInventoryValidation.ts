
import { EquipmentItem } from '@/types/inventory';
import { toast } from 'sonner';
import { useInventoryDefaults } from './useInventoryDefaults';
import { useMemo, useCallback } from 'react';

export const useInventoryValidation = () => {
  const { DEFAULT_EQUIPMENT_TYPES } = useInventoryDefaults();

  const cleanupDuplicateDeployments = useCallback((items: EquipmentItem[]): EquipmentItem[] => {
    console.log('Cleaning up duplicate deployments...');
    const deploymentMap = new Map<string, EquipmentItem>();
    const cleanedItems: EquipmentItem[] = [];
    let hasChanges = false;
    
    for (const item of items) {
      if (item.status === 'deployed' && item.jobId) {
        const deploymentKey = `${item.typeId}-${item.jobId}`;
        
        if (deploymentMap.has(deploymentKey)) {
          // Found duplicate - consolidate quantities
          const existing = deploymentMap.get(deploymentKey)!;
          console.log(`Consolidating duplicate deployment: ${deploymentKey} (${existing.quantity} + ${item.quantity})`);
          existing.quantity += item.quantity;
          existing.lastUpdated = new Date();
          hasChanges = true;
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
    
    // Only return new array if there were actual changes
    if (!hasChanges) {
      console.log('No duplicate deployments found, returning original array');
      return items;
    }
    
    const removedCount = items.length - cleanedItems.length;
    if (removedCount > 0) {
      console.log(`Removed ${removedCount} duplicate deployment records`);
      toast.info(`Cleaned up ${removedCount} duplicate equipment records`);
    }
    
    return cleanedItems;
  }, []);

  const ensureMinimumInventory = useCallback((items: EquipmentItem[]): EquipmentItem[] => {
    const updatedItems = [...items];
    const midlandOfficeId = '1';
    let hasChanges = false;
    
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
        hasChanges = true;
      } else if (existingItem.quantity < 5) {
        // Top up if quantity is too low
        existingItem.quantity = Math.max(existingItem.quantity + 10, 15);
        existingItem.lastUpdated = new Date();
        hasChanges = true;
      }
    });
    
    // Only return new array if there were actual changes
    return hasChanges ? updatedItems : items;
  }, [DEFAULT_EQUIPMENT_TYPES]);

  return {
    cleanupDuplicateDeployments,
    ensureMinimumInventory,
  };
};
