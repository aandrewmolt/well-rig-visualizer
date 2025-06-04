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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useInventory } from '@/contexts/InventoryContext';
import StorageTransferManager from '@/components/inventory/StorageTransferManager';
import RedTagManager from '@/components/inventory/RedTagManager';
import DataInitializationGuard from '@/components/inventory/DataInitializationGuard';

const Inventory = () => {
  const { data, updateSingleEquipmentItem } = useInventory();

  const getTypeName = (typeId: string) => {
    const type = data.equipmentTypes.find(t => t.id === typeId);
    return type?.name || 'Unknown Type';
  };

  const getLocationName = (locationId: string) => {
    const location = data.storageLocations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  return (
    <DataInitializationGuard>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.equipmentItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{getTypeName(item.typeId)}</TableCell>
                          <TableCell>{getLocationName(item.locationId)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.status === 'available' ? 'bg-green-100 text-green-800' :
                              item.status === 'deployed' ? 'bg-blue-100 text-blue-800' :
                              item.status === 'red-tagged' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <StorageTransferManager />
            </div>

            <div className="mt-8">
              <RedTagManager />
            </div>
          </div>
        </div>
      </div>
    </DataInitializationGuard>
  );
};

export default Inventory;
