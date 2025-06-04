
import { useCallback } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { toast } from 'sonner';

export const useEquipmentDeployment = () => {
  const { data, updateIndividualEquipment } = useInventory();

  const deployEquipment = useCallback(async (equipmentId: string, jobId: string) => {
    try {
      await updateIndividualEquipment(equipmentId, { 
        status: 'deployed',
        jobId: jobId,
        locationId: jobId, // Use job ID as location when deployed
        locationType: 'job'
      });
      toast.success(`Equipment deployed to job`);
    } catch (error) {
      console.error('Failed to deploy equipment:', error);
      toast.error('Failed to deploy equipment');
    }
  }, [updateIndividualEquipment]);

  const returnEquipment = useCallback(async (equipmentId: string) => {
    try {
      // Find the default storage location
      const defaultLocation = data.storageLocations.find(loc => loc.isDefault);
      if (!defaultLocation) {
        throw new Error('No default storage location found');
      }

      await updateIndividualEquipment(equipmentId, { 
        status: 'available',
        jobId: null,
        locationId: defaultLocation.id,
        locationType: 'storage'
      });
      toast.success(`Equipment returned to inventory`);
    } catch (error) {
      console.error('Failed to return equipment:', error);
      toast.error('Failed to return equipment');
    }
  }, [updateIndividualEquipment, data.storageLocations]);

  return {
    deployEquipment,
    returnEquipment,
  };
};
