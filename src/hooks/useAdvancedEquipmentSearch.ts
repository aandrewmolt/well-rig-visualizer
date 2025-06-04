
import { useState, useMemo } from 'react';
import { useInventoryData } from './useInventoryData';

export const useAdvancedEquipmentSearch = () => {
  const { data } = useInventoryData();
  const [searchFilters, setSearchFilters] = useState({
    query: '',
    category: '',
    status: '',
    location: '',
    equipmentType: '',
    showIndividualOnly: false,
    showBulkOnly: false
  });

  const searchResults = useMemo(() => {
    let results: any[] = [];

    // Combine all equipment into searchable format
    const allEquipment = [
      ...data.equipmentItems.map(item => ({
        ...item,
        type: 'bulk',
        displayName: data.equipmentTypes.find(t => t.id === item.typeId)?.name || 'Unknown',
        searchableText: `${data.equipmentTypes.find(t => t.id === item.typeId)?.name} ${item.notes || ''}`
      })),
      ...data.individualEquipment.map(eq => ({
        ...eq,
        type: 'individual',
        displayName: `${eq.equipmentId} - ${eq.name}`,
        searchableText: `${eq.equipmentId} ${eq.name} ${eq.serialNumber || ''} ${eq.notes || ''}`
      }))
    ];

    // Apply filters
    results = allEquipment.filter(item => {
      // Text search
      if (searchFilters.query) {
        const query = searchFilters.query.toLowerCase();
        if (!item.searchableText.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Category filter
      if (searchFilters.category) {
        const equipmentType = data.equipmentTypes.find(t => t.id === item.typeId);
        if (!equipmentType || equipmentType.category !== searchFilters.category) {
          return false;
        }
      }

      // Status filter
      if (searchFilters.status && item.status !== searchFilters.status) {
        return false;
      }

      // Location filter
      if (searchFilters.location && item.locationId !== searchFilters.location) {
        return false;
      }

      // Equipment type filter
      if (searchFilters.equipmentType && item.typeId !== searchFilters.equipmentType) {
        return false;
      }

      // Individual/bulk filter
      if (searchFilters.showIndividualOnly && item.type !== 'individual') {
        return false;
      }

      if (searchFilters.showBulkOnly && item.type !== 'bulk') {
        return false;
      }

      return true;
    });

    return results;
  }, [data, searchFilters]);

  const updateFilter = (key: string, value: any) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchFilters({
      query: '',
      category: '',
      status: '',
      location: '',
      equipmentType: '',
      showIndividualOnly: false,
      showBulkOnly: false
    });
  };

  const getFilterSummary = () => {
    const activeFilters = Object.entries(searchFilters)
      .filter(([key, value]) => {
        if (typeof value === 'boolean') return value;
        return value && value !== '';
      })
      .map(([key, value]) => {
        switch (key) {
          case 'query': return `Text: "${value}"`;
          case 'category': return `Category: ${value}`;
          case 'status': return `Status: ${value}`;
          case 'location': 
            const location = data.storageLocations.find(l => l.id === value);
            return `Location: ${location?.name || value}`;
          case 'equipmentType':
            const type = data.equipmentTypes.find(t => t.id === value);
            return `Type: ${type?.name || value}`;
          case 'showIndividualOnly': return 'Individual equipment only';
          case 'showBulkOnly': return 'Bulk equipment only';
          default: return `${key}: ${value}`;
        }
      });

    return activeFilters;
  };

  return {
    searchFilters,
    searchResults,
    updateFilter,
    clearFilters,
    getFilterSummary,
    hasActiveFilters: Object.values(searchFilters).some(value => 
      typeof value === 'boolean' ? value : value && value !== ''
    ),
    resultCount: searchResults.length
  };
};
