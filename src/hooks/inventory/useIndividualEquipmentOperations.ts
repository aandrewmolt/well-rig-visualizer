
import { useCallback } from 'react';
import { IndividualEquipment, StorageLocation } from '@/types/inventory';
import { useInventory } from '@/contexts/InventoryContext';
import { toast } from 'sonner';

export const useIndividualEquipmentOperations = (
  individualEquipment: IndividualEquipment[],
  onUpdateEquipment: (equipment: IndividualEquipment[]) => void,
  storageLocations: StorageLocation[]
) => {
  const { updateIndividualEquipment, deleteIndividualEquipment } = useInventory();

  const handleStatusChange = useCallback(async (equipmentId: string, newStatus: 'available' | 'deployed' | 'maintenance' | 'red-tagged' | 'retired') => {
    try {
      await updateIndividualEquipment(equipmentId, { status: newStatus });
      toast.success('Equipment status updated');
    } catch (error) {
      console.error('Failed to update equipment status:', error);
      toast.error('Failed to update equipment status');
    }
  }, [updateIndividualEquipment]);

  const handleLocationChange = useCallback(async (equipmentId: string, newLocationId: string) => {
    try {
      await updateIndividualEquipment(equipmentId, { location_id: newLocationId });
      toast.success('Equipment location updated');
    } catch (error) {
      console.error('Failed to update equipment location:', error);
      toast.error('Failed to update equipment location');
    }
  }, [updateIndividualEquipment]);

  const handleDelete = useCallback(async (equipmentId: string) => {
    const equipment = individualEquipment.find(eq => eq.id === equipmentId);
    if (equipment?.status === 'deployed') {
      toast.error('Cannot delete deployed equipment');
      return;
    }

    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await deleteIndividualEquipment(equipmentId);
        toast.success('Equipment deleted');
      } catch (error) {
        console.error('Failed to delete equipment:', error);
        toast.error('Failed to delete equipment');
      }
    }
  }, [individualEquipment, deleteIndividualEquipment]);

  return {
    handleStatusChange,
    handleLocationChange,
    handleDelete,
  };
};
