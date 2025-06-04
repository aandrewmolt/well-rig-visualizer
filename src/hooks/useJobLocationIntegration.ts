
import { useMemo } from 'react';
import { useSupabaseJobs } from './useSupabaseJobs';
import { useInventory } from '@/contexts/InventoryContext';
import { StorageLocation } from '@/types/inventory';

// Extended location type that includes both storage locations and job locations
export interface ExtendedLocation extends StorageLocation {
  locationType: 'storage' | 'job';
  jobId?: string;
}

export const useJobLocationIntegration = () => {
  const { jobs } = useSupabaseJobs();
  const { data } = useInventory();

  // Combine storage locations and jobs into a unified location list
  const allLocations = useMemo((): ExtendedLocation[] => {
    const storageLocations: ExtendedLocation[] = data.storageLocations.map(location => ({
      ...location,
      locationType: 'storage' as const,
    }));

    const jobLocations: ExtendedLocation[] = jobs.map(job => ({
      id: job.id,
      name: job.name,
      address: undefined,
      isDefault: false,
      locationType: 'job' as const,
      jobId: job.id,
    }));

    return [...storageLocations, ...jobLocations];
  }, [data.storageLocations, jobs]);

  // Get location by ID (works for both storage locations and jobs)
  const getLocationById = (locationId: string) => {
    return allLocations.find(location => location.id === locationId);
  };

  // Get location name by ID
  const getLocationName = (locationId: string) => {
    const location = getLocationById(locationId);
    return location?.name || 'Unknown Location';
  };

  // Check if a location is a job
  const isJobLocation = (locationId: string) => {
    const location = getLocationById(locationId);
    return location?.locationType === 'job';
  };

  // Get equipment by location (including job locations)
  const getEquipmentByLocation = (locationId: string) => {
    const bulkEquipment = data.equipmentItems.filter(item => item.locationId === locationId);
    const individualEquipment = data.individualEquipment.filter(item => item.locationId === locationId);
    
    return {
      bulkEquipment,
      individualEquipment,
      totalItems: bulkEquipment.length + individualEquipment.length,
    };
  };

  // Get equipment summary by location
  const getEquipmentSummaryByLocation = (locationId: string) => {
    const { bulkEquipment, individualEquipment } = getEquipmentByLocation(locationId);
    
    const summary = new Map<string, { typeName: string; count: number; category: string }>();
    
    // Process bulk equipment
    bulkEquipment.forEach(item => {
      const type = data.equipmentTypes.find(t => t.id === item.typeId);
      if (type) {
        const key = type.id;
        const existing = summary.get(key) || { typeName: type.name, count: 0, category: type.category };
        summary.set(key, { ...existing, count: existing.count + item.quantity });
      }
    });

    // Process individual equipment
    individualEquipment.forEach(item => {
      const type = data.equipmentTypes.find(t => t.id === item.typeId);
      if (type) {
        const key = type.id;
        const existing = summary.get(key) || { typeName: type.name, count: 0, category: type.category };
        summary.set(key, { ...existing, count: existing.count + 1 });
      }
    });

    return Array.from(summary.values());
  };

  return {
    allLocations,
    storageLocations: data.storageLocations,
    jobLocations: jobs.map(job => ({
      id: job.id,
      name: job.name,
      locationType: 'job' as const,
      jobId: job.id,
    })),
    getLocationById,
    getLocationName,
    isJobLocation,
    getEquipmentByLocation,
    getEquipmentSummaryByLocation,
  };
};
