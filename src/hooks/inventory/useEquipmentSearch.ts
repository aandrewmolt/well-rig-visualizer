
import { useState, useMemo } from 'react';
import { EquipmentItem, IndividualEquipment, EquipmentType, StorageLocation } from '@/types/inventory';

interface UseEquipmentSearchProps {
  equipmentItems: EquipmentItem[];
  individualEquipment: IndividualEquipment[];
  equipmentTypes: EquipmentType[];
  storageLocations: StorageLocation[];
}

export const useEquipmentSearch = ({
  equipmentItems,
  individualEquipment,
  equipmentTypes,
  storageLocations
}: UseEquipmentSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const getEquipmentTypeName = (typeId: string) => {
    return equipmentTypes.find(type => type.id === typeId)?.name || 'Unknown Type';
  };

  const getEquipmentTypeCategory = (typeId: string) => {
    return equipmentTypes.find(type => type.id === typeId)?.category || 'other';
  };

  const getLocationName = (locationId: string) => {
    return storageLocations.find(loc => loc.id === locationId)?.name || 'Unknown Location';
  };

  const filteredEquipmentItems = useMemo(() => {
    return equipmentItems.filter(item => {
      const equipmentType = equipmentTypes.find(type => type.id === item.typeId);
      const location = storageLocations.find(loc => loc.id === item.locationId);
      
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = equipmentType?.name.toLowerCase().includes(searchLower);
        const matchesLocation = location?.name.toLowerCase().includes(searchLower);
        const matchesNotes = item.notes?.toLowerCase().includes(searchLower);
        const matchesJobId = item.jobId?.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesLocation && !matchesNotes && !matchesJobId) return false;
      }
      
      // Status filter
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      
      // Location filter
      if (filterLocation !== 'all' && item.locationId !== filterLocation) return false;
      
      // Category filter
      if (filterCategory !== 'all' && equipmentType?.category !== filterCategory) return false;
      
      return true;
    });
  }, [equipmentItems, equipmentTypes, storageLocations, searchTerm, filterStatus, filterLocation, filterCategory]);

  const filteredIndividualEquipment = useMemo(() => {
    return individualEquipment.filter(item => {
      const equipmentType = equipmentTypes.find(type => type.id === item.typeId);
      const location = storageLocations.find(loc => loc.id === item.locationId);
      
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(searchLower);
        const matchesEquipmentId = item.equipmentId.toLowerCase().includes(searchLower);
        const matchesTypeName = equipmentType?.name.toLowerCase().includes(searchLower);
        const matchesLocation = location?.name.toLowerCase().includes(searchLower);
        const matchesNotes = item.notes?.toLowerCase().includes(searchLower);
        const matchesSerial = item.serialNumber?.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesEquipmentId && !matchesTypeName && !matchesLocation && !matchesNotes && !matchesSerial) return false;
      }
      
      // Status filter
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      
      // Location filter
      if (filterLocation !== 'all' && item.locationId !== filterLocation) return false;
      
      // Category filter
      if (filterCategory !== 'all' && equipmentType?.category !== filterCategory) return false;
      
      return true;
    });
  }, [individualEquipment, equipmentTypes, storageLocations, searchTerm, filterStatus, filterLocation, filterCategory]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterLocation('all');
    setFilterCategory('all');
  };

  const availableCategories = useMemo(() => {
    return [...new Set(equipmentTypes.map(type => type.category))];
  }, [equipmentTypes]);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterLocation,
    setFilterLocation,
    filterCategory,
    setFilterCategory,
    filteredEquipmentItems,
    filteredIndividualEquipment,
    clearFilters,
    availableCategories,
    getEquipmentTypeName,
    getEquipmentTypeCategory,
    getLocationName,
  };
};
