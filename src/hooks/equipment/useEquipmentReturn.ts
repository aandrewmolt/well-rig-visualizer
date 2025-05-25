
import { useInventoryData } from '@/hooks/useInventoryData';
import { toast } from 'sonner';

export const useEquipmentReturn = (jobId: string) => {
  const { data, updateEquipmentItems } = useInventoryData();

  const returnAllJobEquipment = () => {
    console.log(`Returning all equipment for job ${jobId}`);
    
    const deployedItems = data.equipmentItems.filter(
      item => item.status === 'deployed' && item.jobId === jobId
    );

    if (deployedItems.length === 0) {
      console.log('No deployed equipment found for this job');
      return;
    }

    const updatedItems = data.equipmentItems.map(item => {
      if (item.status === 'deployed' && item.jobId === jobId) {
        // Find corresponding available item to return quantity to
        const availableItem = data.equipmentItems.find(
          availItem => 
            availItem.typeId === item.typeId && 
            availItem.locationId === item.locationId && 
            availItem.status === 'available'
        );
        
        if (availableItem) {
          availableItem.quantity += item.quantity;
          availableItem.lastUpdated = new Date();
        } else {
          // Create new available item if none exists
          return {
            id: `returned-${item.typeId}-${item.locationId}-${Date.now()}`,
            typeId: item.typeId,
            locationId: item.locationId,
            quantity: item.quantity,
            status: 'available' as const,
            lastUpdated: new Date(),
          };
        }
        return null; // Mark deployed item for removal
      }
      return item;
    }).filter(Boolean);

    updateEquipmentItems(updatedItems as any[]);
    
    const returnedCount = deployedItems.length;
    const returnedItems = deployedItems.map(item => {
      const type = data.equipmentTypes.find(t => t.id === item.typeId);
      return `${item.quantity}x ${type?.name || 'Unknown'}`;
    }).join(', ');

    toast.success(`Returned ${returnedCount} equipment types: ${returnedItems}`);
    console.log('Equipment return completed:', { jobId, returnedCount, deployedItems });
  };

  return {
    returnAllJobEquipment,
  };
};
