
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface DraftItemsListProps {
  draftItems: any[];
}

const DraftItemsList: React.FC<DraftItemsListProps> = ({ draftItems }) => {
  if (draftItems.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-3">
        <div className="text-xs text-orange-700 mb-2">Draft Items (not saved):</div>
        <div className="space-y-1">
          {draftItems.map((item, index) => (
            <div key={index} className="flex justify-between text-xs p-1 bg-white rounded border">
              <span>{item.equipmentId}</span>
              <Badge variant="outline" className="text-xs px-1 border-orange-300">
                draft
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DraftItemsList;
