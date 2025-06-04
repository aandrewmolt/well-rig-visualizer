import { useCallback } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { useEquipmentIdGenerator } from './useEquipmentIdGenerator';
import { toast } from 'sonner';

export const useEquipmentMigration = () => {
  const { data, updateIndividualEquipment } = useInventory();
  const { generateEquipmentName } = useEquipmentIdGenerator();

  const migrateEquipmentNaming = useCallback(async () => {
    try {
      console.log('Starting aggressive equipment naming migration...');
      
      const updates = [];
      
      for (const equipment of data.individualEquipment) {
        const equipmentType = data.equipmentTypes.find(type => type.id === equipment.typeId);
        if (!equipmentType) continue;

        let needsUpdate = false;
        let newEquipmentId = equipment.equipmentId;
        let newName = equipment.name;

        // Remove dashes from equipment IDs first
        if (equipment.equipmentId.includes('-')) {
          newEquipmentId = equipment.equipmentId.replace(/-/g, '');
          needsUpdate = true;
        }

        // Extract prefix and number part for ID formatting
        const prefix = newEquipmentId.substring(0, 2);
        let numberPart = newEquipmentId.substring(2);
        
        // Convert number part to integer and back to ensure it's clean
        const numberInt = parseInt(numberPart) || 1;
        
        // Fix zero padding based on correct rules
        if (prefix === 'SS') {
          // ShearStream: 4 digits (SS0001)
          newEquipmentId = `${prefix}${numberInt.toString().padStart(4, '0')}`;
        } else if (prefix === 'CC' || prefix === 'CT' || prefix === 'SL') {
          // Customer Computer, Customer Tablet, Starlink: 2 digits (CC01, CT01, SL01)
          newEquipmentId = `${prefix}${numberInt.toString().padStart(2, '0')}`;
        } else {
          // Others (PG, BP): 3 digits (PG001, BP001)
          newEquipmentId = `${prefix}${numberInt.toString().padStart(3, '0')}`;
        }

        if (newEquipmentId !== equipment.equipmentId) {
          needsUpdate = true;
        }

        // AGGRESSIVE name fixing - check for ANY old naming patterns
        const oldNamePatterns = [
          'Alpha', 'Beta', 'Gamma', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel',
          'Unit', 'Terminal', 'Field', 'Laptop', 'Dell', 'Lenovo', 'HP', 'Computer',
          'Tablet', 'iPad', 'Surface', 'Android', 'Gauge', 'Pressure', '1502',
          'Battery', 'Pack', 'Power', 'Box', 'Dish', 'Sat'
        ];

        const hasOldNaming = oldNamePatterns.some(pattern => 
          equipment.name.toLowerCase().includes(pattern.toLowerCase())
        );

        // Generate correct names based on equipment type and new ID
        if (equipmentType.name === 'ShearStream Box') {
          const numberPart = newEquipmentId.replace('SS', '');
          newName = `ShearStream-${numberPart}`;
          needsUpdate = true;
        } else if (equipmentType.name === 'Starlink') {
          const numberPart = newEquipmentId.replace('SL', '');
          newName = `Starlink-${numberPart}`;
          needsUpdate = true;
        } else if (equipmentType.name === 'Customer Computer') {
          const numberPart = newEquipmentId.replace('CC', '');
          newName = `Customer Computer ${numberPart}`;
          needsUpdate = true;
        } else if (equipmentType.name === 'Customer Tablet') {
          const numberPart = newEquipmentId.replace('CT', '');
          newName = `Customer Tablet ${numberPart}`;
          needsUpdate = true;
        } else if (equipmentType.name === '1502 Pressure Gauge') {
          const numberPart = newEquipmentId.replace('PG', '');
          newName = `Pressure Gauge ${numberPart}`;
          needsUpdate = true;
        } else if (equipmentType.name === 'Battery Pack') {
          const numberPart = newEquipmentId.replace('BP', '');
          newName = `Battery Pack ${numberPart}`;
          needsUpdate = true;
        }

        if (needsUpdate) {
          updates.push({
            id: equipment.id,
            equipmentId: newEquipmentId,
            name: newName,
            originalName: equipment.name,
            originalId: equipment.equipmentId
          });
        }
      }

      if (updates.length > 0) {
        console.log(`Updating ${updates.length} equipment items...`);
        console.log('Updates:', updates);
        
        // Update each equipment item
        for (const update of updates) {
          console.log(`Updating ${update.originalId} (${update.originalName}) -> ${update.equipmentId} (${update.name})`);
          await updateIndividualEquipment(update.id, {
            equipmentId: update.equipmentId,
            name: update.name
          });
        }

        toast.success(`Updated ${updates.length} equipment items with correct naming and IDs`);
        console.log('Equipment migration completed successfully');
      } else {
        toast.info('No equipment items needed migration');
        console.log('No equipment items needed migration');
      }

    } catch (error) {
      console.error('Failed to migrate equipment naming:', error);
      toast.error('Failed to migrate equipment naming');
    }
  }, [data.individualEquipment, data.equipmentTypes, updateIndividualEquipment]);

  return {
    migrateEquipmentNaming
  };
};
