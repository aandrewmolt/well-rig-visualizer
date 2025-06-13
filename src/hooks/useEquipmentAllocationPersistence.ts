import { useEffect, useCallback } from 'react';
import { EquipmentAllocation } from '@/hooks/useInventoryMapperSync';

const ALLOCATIONS_STORAGE_KEY = 'equipment-allocations';

export const useEquipmentAllocationPersistence = () => {
  // Load allocations from localStorage
  const loadAllocations = useCallback((): Map<string, EquipmentAllocation> => {
    try {
      const stored = localStorage.getItem(ALLOCATIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert array back to Map
        return new Map(Object.entries(parsed).map(([key, value]: [string, any]) => [
          key,
          {
            ...value,
            timestamp: new Date(value.timestamp)
          }
        ]));
      }
    } catch (error) {
      console.error('Failed to load equipment allocations:', error);
    }
    return new Map();
  }, []);

  // Save allocations to localStorage
  const saveAllocations = useCallback((allocations: Map<string, EquipmentAllocation>) => {
    try {
      // Convert Map to object for JSON serialization
      const toStore = Object.fromEntries(
        Array.from(allocations.entries()).map(([key, value]) => [
          key,
          {
            ...value,
            timestamp: value.timestamp.toISOString()
          }
        ])
      );
      localStorage.setItem(ALLOCATIONS_STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to save equipment allocations:', error);
    }
  }, []);

  // Clear expired allocations (older than 24 hours)
  const clearExpiredAllocations = useCallback((allocations: Map<string, EquipmentAllocation>) => {
    const now = new Date();
    const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const cleaned = new Map<string, EquipmentAllocation>();

    allocations.forEach((allocation, equipmentId) => {
      const age = now.getTime() - allocation.timestamp.getTime();
      if (age < expirationTime) {
        cleaned.set(equipmentId, allocation);
      }
    });

    return cleaned;
  }, []);

  return {
    loadAllocations,
    saveAllocations,
    clearExpiredAllocations
  };
};