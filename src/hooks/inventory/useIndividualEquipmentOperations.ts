
import { useCallback } from 'react';
import { IndividualEquipment } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';

export const useIndividualEquipmentOperations = (
  individualEquipment: IndividualEquipment[],
  updateIndividualEquipment: (equipment: IndividualEquipment[]) => void,
  storageLocations: any[]
) => {
  const handleDelete = useCallback((equipmentId: string) => {
    const equipment = individualEquipment.find(eq => eq.id === equipmentId);
    if (equipment?.status === 'deployed') {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete deployed equipment",
        variant: "destructive",
      });
      return;
    }

    const updatedEquipment = individualEquipment.filter(eq => eq.id !== equipmentId);
    updateIndividualEquipment(updatedEquipment);
    toast({
      title: "Equipment Deleted",
      description: "Equipment deleted successfully",
    });
  }, [individualEquipment, updateIndividualEquipment]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'deployed': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'red-tagged': return 'bg-red-100 text-red-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getLocationName = useCallback((locationId: string) => {
    return storageLocations.find(loc => loc.id === locationId)?.name || 'Unknown';
  }, [storageLocations]);

  return {
    handleDelete,
    getStatusColor,
    getLocationName,
  };
};
