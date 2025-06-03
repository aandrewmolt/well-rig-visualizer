import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useInventoryData } from '@/hooks/useInventoryData';
import StorageTransferManager from '@/components/inventory/StorageTransferManager';
import RedTagManager from '@/components/inventory/RedTagManager';

const Inventory = () => {
  const { data, updateSingleEquipmentItem } = useInventoryData();
  const [isRedTagOpen, setIsRedTagOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleRedTag = (itemId: string, reason: string, photo?: string, location?: string) => {
    updateSingleEquipmentItem(itemId, {
      status: 'red-tagged',
      redTagReason: reason,
      redTagPhoto: photo,
    });
    setIsRedTagOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppHeader />
      
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Equipment Inventory</h1>
              <p className="text-gray-600">
                Track equipment across all locations and jobs. Manage availability and deployments.
              </p>
            </div>
            <Link to="/inventory/settings">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Settings className="mr-2 h-4 w-4" />
                Inventory Settings
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment List</CardTitle>
                <CardDescription>All equipment items in inventory</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.equipmentItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.typeId}</TableCell>
                        <TableCell>{item.locationId}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsRedTagOpen(true);
                            }}
                          >
                            Red Tag
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <StorageTransferManager />
          </div>
        </div>
      </div>

      <RedTagManager
        isOpen={isRedTagOpen}
        onClose={() => setIsRedTagOpen(false)}
        equipmentItem={selectedItem}
        onRedTag={handleRedTag}
      />
    </div>
  );
};

export default Inventory;
