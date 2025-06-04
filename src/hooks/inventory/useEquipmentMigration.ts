
import { useCallback } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { useEquipmentIdGenerator } from './useEquipmentIdGenerator';
import { toast } from 'sonner';

export const useEquipmentMigration = () => {
  const { data, updateIndividualEquipment } = useInventory();
  const { generateEquipmentName } = useEquipmentIdGenerator();

  const migrateEquipmentNaming = useCallback(async () => {
    try {
      console.log('Starting equipment naming migration...');
      
      const updates = [];
      
      for (const equipment of data.individualEquipment) {
        const equipmentType = data.equipmentTypes.find(type => type.id === equipment.typeId);
        if (!equipmentType) continue;

        let needsUpdate = false;
        let newEquipmentId = equipment.equipmentId;
        let newName = equipment.name;

        // Remove dashes from equipment IDs
        if (equipment.equipmentId.includes('-')) {
          newEquipmentId = equipment.equipmentId.replace(/-/g, '');
          needsUpdate = true;
        }

        // Fix naming for specific equipment types
        if (equipmentType.name === 'ShearStream Box') {
          const expectedName = generateEquipmentName(equipmentType, newEquipmentId);
          if (equipment.name !== expectedName && 
              (equipment.name.includes('Alpha') || equipment.name.includes('Beta') || 
               equipment.name.includes('Gamma') || equipment.name.includes('Unit'))) {
            newName = expectedName;
            needsUpdate = true;
          }
        }

        if (equipmentType.name === 'Starlink') {
          const expectedName = generateEquipmentName(equipmentType, newEquipmentId);
          if (equipment.name !== expectedName && 
              (equipment.name.includes('Terminal') || equipment.name.includes('1') || equipment.name.includes('2'))) {
            newName = expectedName;
            needsUpdate = true;
          }
        }

        if (equipmentType.name === 'Customer Computer') {
          const expectedName = generateEquipmentName(equipmentType, newEquipmentId);
          if (equipment.name !== expectedName && 
              (equipment.name.includes('Field') || equipment.name.includes('Laptop') || 
               equipment.name.includes('Dell') || equipment.name.includes('Lenovo'))) {
            newName = expectedName;
            needsUpdate = true;
          }
        }

        if (needsUpdate) {
          updates.push({
            id: equipment.id,
            equipmentId: newEquipmentId,
            name: newName
          });
        }
      }

      if (updates.length > 0) {
        console.log(`Updating ${updates.length} equipment items...`);
        
        // Update each equipment item
        for (const update of updates) {
          await updateIndividualEquipment(update.id, {
            equipmentId: update.equipmentId,
            name: update.name
          });
        }

        toast.success(`Updated ${updates.length} equipment items with correct naming`);
        console.log('Equipment migration completed successfully');
      } else {
        toast.info('No equipment items needed migration');
        console.log('No equipment items needed migration');
      }

    } catch (error) {
      console.error('Failed to migrate equipment naming:', error);
      toast.error('Failed to migrate equipment naming');
    }
  }, [data.individualEquipment, data.equipmentTypes, updateIndividualEquipment, generateEquipmentName]);

  return {
    migrateEquipmentNaming
  };
};
