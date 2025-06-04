
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { InventoryData } from '@/types/inventory';

interface EquipmentListFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterLocation: string;
  setFilterLocation: (value: string) => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  data: InventoryData;
  onClearFilters: () => void;
  getCategoryColor: (category: string) => string;
}

const EquipmentListFilters: React.FC<EquipmentListFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterLocation,
  setFilterLocation,
  filterCategory,
  setFilterCategory,
  data,
  onClearFilters,
  getCategoryColor,
}) => {
  // Get unique categories for filter - filter out empty categories
  const availableCategories = [...new Set(data.equipmentTypes.map(type => type.category))].filter(category => category && category.trim() !== '');

  return (
    <div className="flex flex-wrap gap-4 mt-4">
      <div className="flex-1 min-w-64">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search equipment, location, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <Select value={filterCategory} onValueChange={setFilterCategory}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {availableCategories.map(category => (
            <SelectItem key={category} value={category}>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getCategoryColor(category)}>
                  {category}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="deployed">Deployed</SelectItem>
          <SelectItem value="red-tagged">Red Tagged</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterLocation} onValueChange={setFilterLocation}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {data.storageLocations.filter(location => location.id && location.id.trim() !== '').map(location => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={onClearFilters} variant="outline">
        Clear Filters
      </Button>
    </div>
  );
};

export default EquipmentListFilters;
