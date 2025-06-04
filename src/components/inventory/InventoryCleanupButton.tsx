
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wrench, CheckCircle, AlertTriangle } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { useInventoryCleanup } from '@/hooks/inventory/useInventoryCleanup';
import { toast } from 'sonner';

const InventoryCleanupButton: React.FC = () => {
  const { data, updateEquipmentItems } = useInventory();
  const { mergeAndCleanupInventory, ensureRequiredItemsExist } = useInventoryCleanup();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cleanupResults, setCleanupResults] = useState<{
    duplicatesFound: number;
    itemsAdded: number;
    totalCleaned: number;
  } | null>(null);

  const runInventoryCleanup = async () => {
    setIsProcessing(true);
    try {
      const originalCount = data.equipmentItems.length;
      
      // Step 1: Merge duplicates
      const mergedItems = mergeAndCleanupInventory(data.equipmentItems);
      const duplicatesFound = originalCount - mergedItems.length;
      
      // Step 2: Ensure required items exist
      const finalItems = ensureRequiredItemsExist(mergedItems);
      const itemsAdded = finalItems.length - mergedItems.length;
      
      // Update the inventory
      updateEquipmentItems(finalItems);
      
      const results = {
        duplicatesFound,
        itemsAdded,
        totalCleaned: duplicatesFound + itemsAdded
      };
      
      setCleanupResults(results);
      
      if (results.totalCleaned > 0) {
        toast.success(`Inventory cleanup complete! Merged ${duplicatesFound} duplicates and added ${itemsAdded} missing items.`);
      } else {
        toast.success('Inventory is already clean - no issues found!');
      }
      
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error('Failed to cleanup inventory');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Inventory Cleanup & Duplicate Merger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          This tool will merge duplicate equipment items at the same location and ensure all required cable types exist in your inventory.
        </div>
        
        <Button
          onClick={runInventoryCleanup}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Wrench className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wrench className="mr-2 h-4 w-4" />
              Run Inventory Cleanup
            </>
          )}
        </Button>

        {cleanupResults && (
          <Alert className={cleanupResults.totalCleaned > 0 ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}>
            {cleanupResults.totalCleaned > 0 ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-blue-600" />
            )}
            <AlertDescription className={cleanupResults.totalCleaned > 0 ? "text-green-800" : "text-blue-800"}>
              <div className="font-medium mb-1">Cleanup Results:</div>
              <ul className="text-sm space-y-1">
                <li>• Duplicates merged: {cleanupResults.duplicatesFound}</li>
                <li>• Missing items added: {cleanupResults.itemsAdded}</li>
                <li>• Total changes: {cleanupResults.totalCleaned}</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryCleanupButton;
