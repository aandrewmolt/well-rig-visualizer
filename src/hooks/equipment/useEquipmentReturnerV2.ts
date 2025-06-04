
import { useCallback } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { toast } from 'sonner';

export const useEquipmentReturnerV2 = (jobId: string) => {
  const { data, updateIndividualEquipment } = useInventory();

  const returnAllJobEquipment = useCallback(() => {
    console.log(`Returning all equipment for job ${jobId}`);
    
    const deployedEquipment = data.individualEquipment.filter(
      item => item.status === 'deployed' && item.jobId === jobId
    );

    deployedEquipment.forEach(item => {
      updateIndividualEquipment(item.id, {
        status: 'available',
        jobId: null
      });
    });

    toast.success('All equipment returned to storage');
  }, [jobId, data.individualEquipment, updateIndividualEquipment]);

  return {
    returnAllJobEquipment
  };
};
