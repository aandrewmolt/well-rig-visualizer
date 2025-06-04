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

        // Remove dashes from equipment IDs and ensure consistent padding
        if (equipment.equipmentId.includes('-')) {
          newEquipmentId = equipment.equipmentId.replace(/-/g, '');
          needsUpdate = true;
        }

        // Ensure consistent zero padding for all equipment types
        const prefix = newEquipmentId.substring(0, 2);
        const numberPart = newEquipmentId.substring(2);
        
        if (prefix === 'SS') {
          // ShearStream: 4 digits (SS0001)
          const paddedNumber = numberPart.padStart(4, '0');
          newEquipmentId = `${prefix}${paddedNumber}`;
        } else if (prefix === 'SL') {
          // Starlink: 2 digits (SL01)
          const paddedNumber = numberPart.padStart(2, '0');
          newEquipmentId = `${prefix}${paddedNumber}`;
        } else {
          // Others (CC, CT, PG, BP): 3 digits (CC001, CT001, etc.)
          const paddedNumber = numberPart.padStart(3, '0');
          newEquipmentId = `${prefix}${paddedNumber}`;
        }

        if (newEquipmentId !== equipment.equipmentId) {
          needsUpdate = true;
        }

        // Fix naming for specific equipment types with consistent zero padding
        if (equipmentType.name === 'ShearStream Box') {
          const numberPart = newEquipmentId.replace('SS', '');
          const expectedName = `ShearStream-${numberPart}`;
          if (equipment.name !== expectedName && 
              (equipment.name.includes('Alpha') || equipment.name.includes('Beta') || 
               equipment.name.includes('Gamma') || equipment.name.includes('Unit'))) {
            newName = expectedName;
            needsUpdate = true;
          }
        }

        if (equipmentType.name === 'Starlink') {
          const numberPart = newEquipmentId.replace('SL', '');
          const expectedName = `Starlink-${numberPart}`;
          if (equipment.name !== expectedName && 
              (equipment.name.includes('Terminal') || equipment.name.includes('1') || equipment.name.includes('2'))) {
            newName = expectedName;
            needsUpdate = true;
          }
        }

        if (equipmentType.name === 'Customer Computer') {
          const numberPart = newEquipmentId.replace('CC', '');
          const expectedName = `Customer Computer ${numberPart}`;
          if (equipment.name !== expectedName && 
              (equipment.name.includes('Field') || equipment.name.includes('Laptop') || 
               equipment.name.includes('Dell') || equipment.name.includes('Lenovo'))) {
            newName = expectedName;
            needsUpdate = true;
          }
        }

        if (equipmentType.name === 'Customer Tablet') {
          const numberPart = newEquipmentId.replace('CT', '');
          const expectedName = `Customer Tablet ${numberPart}`;
          if (equipment.name !== expectedName) {
            newName = expectedName;
            needsUpdate = true;
          }
        }

        if (equipmentType.name === '1502 Pressure Gauge') {
          const numberPart = newEquipmentId.replace('PG', '');
          const expectedName = `Pressure Gauge ${numberPart}`;
          if (equipment.name !== expectedName) {
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

        toast.success(`Updated ${updates.length} equipment items with consistent naming`);
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
