
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Save } from 'lucide-react';

interface IndividualEquipmentHeaderProps {
  draftCount: number;
  onSaveDrafts: () => void;
  onOpenForm: () => void;
}

const IndividualEquipmentHeader: React.FC<IndividualEquipmentHeaderProps> = ({
  draftCount,
  onSaveDrafts,
  onOpenForm,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4" />
        <span className="text-sm font-medium">Individual Items</span>
        {draftCount > 0 && (
          <Badge variant="outline" className="bg-orange-50">
            {draftCount} draft
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {draftCount > 0 && (
          <Button size="sm" onClick={onSaveDrafts} variant="outline">
            <Save className="h-3 w-3 mr-1" />
            Save All Drafts
          </Button>
        )}
        
        <Button size="sm" onClick={onOpenForm}>
          Add Item
        </Button>
      </div>
    </div>
  );
};

export default IndividualEquipmentHeader;
