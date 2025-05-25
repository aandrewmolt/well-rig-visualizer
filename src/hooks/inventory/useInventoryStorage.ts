
import { InventoryData } from '@/types/inventory';
import { toast } from 'sonner';

export const useInventoryStorage = () => {
  const saveToLocalStorage = (dataToSave: InventoryData) => {
    try {
      localStorage.setItem('inventory-data', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      toast.error('Failed to save data locally');
    }
  };

  const loadFromLocalStorage = (): InventoryData | null => {
    try {
      const stored = localStorage.getItem('inventory-data');
      if (stored) {
        const parsedData = JSON.parse(stored);
        return {
          ...parsedData,
          lastSync: new Date(parsedData.lastSync),
          // Ensure individualEquipment exists for older data
          individualEquipment: parsedData.individualEquipment || [],
        };
      }
    } catch (error) {
      console.error('Failed to parse stored data:', error);
    }
    return null;
  };

  const syncData = async (currentData: InventoryData): Promise<InventoryData> => {
    // Simulate API call - in real implementation, this would sync with Google Drive
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedData = {
      ...currentData,
      lastSync: new Date(),
    };
    
    saveToLocalStorage(updatedData);
    return updatedData;
  };

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    syncData,
  };
};
