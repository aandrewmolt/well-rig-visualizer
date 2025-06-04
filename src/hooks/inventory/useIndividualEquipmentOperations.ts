
import { useCallback } from 'react';
import { IndividualEquipment, StorageLocation } from '@/types/inventory';
import { toast } from 'sonner';

export const useIndividualEquipmentOperations = (
  individualEquipment: IndividualEquipment[],
  onUpdateEquipment: (equipment: IndividualEquipment[]) => void,
  storageLocations: StorageLocation[]
) => {
  const handleStatusChange = useCallback((equipmentId: string, newStatus: 'available' | 'deployed' | 'maintenance' | 'red-tagged' | 'retired') => {
    const updatedEquipment = individualEquipment.map(eq => 
      eq.id === equipmentId ? { ...eq, status: newStatus, lastUpdated: new Date() } : eq
    );
    onUpdateEquipment(updatedEquipment);
    toast.success('Equipment status updated');
  }, [individualEquipment, onUpdateEquipment]);

  const handleLocationChange = useCallback((equipmentId: string, newLocationId: string) => {
    const updatedEquipment = individualEquipment.map(eq => 
      eq.id === equipmentId ? { ...eq, locationId: newLocationId, lastUpdated: new Date() } : eq
    );
    onUpdateEquipment(updatedEquipment);
    toast.success('Equipment location updated');
  }, [individualEquipment, onUpdateEquipment]);

  const handleDelete = useCallback((equipmentId: string) => {
    const equipment = individualEquipment.find(eq => eq.id === equipmentId);
    if (equipment?.status === 'deployed') {
      toast.error('Cannot delete deployed equipment');
      return;
    }

    if (window.confirm('Are you sure you want to delete this equipment?')) {
      const updatedEquipment = individualEquipment.filter(eq => eq.id !== equipmentId);
      onUpdateEquipment(updatedEquipment);
      toast.success('Equipment deleted');
    }
  }, [individualEquipment, onUpdateEquipment]);

  return {
    handleStatusChange,
    handleLocationChange,
    handleDelete,
  };
};
