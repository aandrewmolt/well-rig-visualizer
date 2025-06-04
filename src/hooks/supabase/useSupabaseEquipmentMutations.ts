
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentType, StorageLocation, EquipmentItem, IndividualEquipment } from '@/types/inventory';
import { toast } from 'sonner';

export const useSupabaseEquipmentMutations = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Equipment Types
  const addEquipmentType = async (type: Omit<EquipmentType, 'id'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('equipment_types')
        .insert([{
          name: type.name,
          category: type.category,
          description: type.description,
          requires_individual_tracking: type.requiresIndividualTracking,
          default_id_prefix: type.defaultIdPrefix
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Equipment type added successfully');
      return data;
    } catch (error) {
      console.error('Error adding equipment type:', error);
      toast.error('Failed to add equipment type');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEquipmentType = async (id: string, updates: Partial<EquipmentType>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('equipment_types')
        .update({
          name: updates.name,
          category: updates.category,
          description: updates.description,
          requires_individual_tracking: updates.requiresIndividualTracking,
          default_id_prefix: updates.defaultIdPrefix
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Equipment type updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating equipment type:', error);
      toast.error('Failed to update equipment type');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEquipmentType = async (id: string) => {
    setIsLoading(true);
    try {
      // Check for dependencies first
      const { data: equipmentItems } = await supabase
        .from('equipment_items')
        .select('id')
        .eq('type_id', id)
        .limit(1);

      const { data: individualEquipment } = await supabase
        .from('individual_equipment')
        .select('id')
        .eq('type_id', id)
        .limit(1);

      if (equipmentItems?.length > 0 || individualEquipment?.length > 0) {
        toast.error('Cannot delete equipment type - it is being used by existing equipment');
        return false;
      }

      const { error } = await supabase
        .from('equipment_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Equipment type deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting equipment type:', error);
      toast.error('Failed to delete equipment type');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Storage Locations
  const addStorageLocation = async (location: Omit<StorageLocation, 'id'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('storage_locations')
        .insert([{
          name: location.name,
          address: location.address,
          is_default: location.isDefault
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Storage location added successfully');
      return data;
    } catch (error) {
      console.error('Error adding storage location:', error);
      toast.error('Failed to add storage location');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStorageLocation = async (id: string, updates: Partial<StorageLocation>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('storage_locations')
        .update({
          name: updates.name,
          address: updates.address,
          is_default: updates.isDefault
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Storage location updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating storage location:', error);
      toast.error('Failed to update storage location');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStorageLocation = async (id: string) => {
    setIsLoading(true);
    try {
      // Check for dependencies first
      const { data: equipmentItems } = await supabase
        .from('equipment_items')
        .select('id')
        .eq('location_id', id)
        .limit(1);

      const { data: individualEquipment } = await supabase
        .from('individual_equipment')
        .select('id')
        .eq('location_id', id)
        .limit(1);

      if (equipmentItems?.length > 0 || individualEquipment?.length > 0) {
        toast.error('Cannot delete storage location - it contains equipment');
        return false;
      }

      const { error } = await supabase
        .from('storage_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Storage location deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting storage location:', error);
      toast.error('Failed to delete storage location');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Equipment Items
  const addEquipmentItem = async (item: Omit<EquipmentItem, 'id' | 'lastUpdated'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('equipment_items')
        .insert([{
          type_id: item.typeId,
          location_id: item.locationId,
          quantity: item.quantity,
          status: item.status,
          job_id: item.jobId,
          notes: item.notes,
          red_tag_reason: item.redTagReason,
          red_tag_photo: item.redTagPhoto,
          location_type: item.location_type || 'storage'
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Equipment item added successfully');
      return data;
    } catch (error) {
      console.error('Error adding equipment item:', error);
      toast.error('Failed to add equipment item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEquipmentItem = async (id: string, updates: Partial<EquipmentItem>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('equipment_items')
        .update({
          type_id: updates.typeId,
          location_id: updates.locationId,
          quantity: updates.quantity,
          status: updates.status,
          job_id: updates.jobId,
          notes: updates.notes,
          red_tag_reason: updates.redTagReason,
          red_tag_photo: updates.redTagPhoto,
          location_type: updates.location_type
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating equipment item:', error);
      toast.error('Failed to update equipment item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEquipmentItem = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('equipment_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Equipment item deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting equipment item:', error);
      toast.error('Failed to delete equipment item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Individual Equipment
  const addIndividualEquipment = async (equipment: Omit<IndividualEquipment, 'id' | 'lastUpdated'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('individual_equipment')
        .insert([{
          equipment_id: equipment.equipmentId,
          name: equipment.name,
          type_id: equipment.typeId,
          location_id: equipment.locationId,
          status: equipment.status,
          job_id: equipment.jobId,
          serial_number: equipment.serialNumber,
          purchase_date: equipment.purchaseDate,
          warranty_expiry: equipment.warrantyExpiry,
          notes: equipment.notes,
          red_tag_reason: equipment.redTagReason,
          red_tag_photo: equipment.redTagPhoto,
          location_type: equipment.location_type || 'storage'
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Individual equipment added successfully');
      return data;
    } catch (error) {
      console.error('Error adding individual equipment:', error);
      toast.error('Failed to add individual equipment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateIndividualEquipment = async (id: string, updates: Partial<IndividualEquipment>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('individual_equipment')
        .update({
          equipment_id: updates.equipmentId,
          name: updates.name,
          type_id: updates.typeId,
          location_id: updates.locationId,
          status: updates.status,
          job_id: updates.jobId,
          serial_number: updates.serialNumber,
          purchase_date: updates.purchaseDate,
          warranty_expiry: updates.warrantyExpiry,
          notes: updates.notes,
          red_tag_reason: updates.redTagReason,
          red_tag_photo: updates.redTagPhoto,
          location_type: updates.location_type
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating individual equipment:', error);
      toast.error('Failed to update individual equipment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteIndividualEquipment = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('individual_equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Individual equipment deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting individual equipment:', error);
      toast.error('Failed to delete individual equipment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    
    // Equipment Types
    addEquipmentType,
    updateEquipmentType,
    deleteEquipmentType,
    
    // Storage Locations
    addStorageLocation,
    updateStorageLocation,
    deleteStorageLocation,
    
    // Equipment Items
    addEquipmentItem,
    updateEquipmentItem,
    deleteEquipmentItem,
    
    // Individual Equipment
    addIndividualEquipment,
    updateIndividualEquipment,
    deleteIndividualEquipment,
  };
};
